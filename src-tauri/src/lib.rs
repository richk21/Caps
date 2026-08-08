use serde::Deserialize;
use std::fs;
use std::path::PathBuf;
use tauri_plugin_shell::ShellExt;

// ======================================================
// TYPES
// ======================================================

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CaptionStyle {
    font_family: String,
    font_size: f64,
    font_weight: u32,

    color: String,

    stroke_color: String,
    stroke_width: f64,

    shadow: bool,
    shadow_color: String,
    shadow_blur: f64,

    position_x: f64,
    position_y: f64,

    max_width: f64,

    karaoke_color: String,

    text_align: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Subtitle {
    id: String,
    start_time: f64,
    end_time: f64,
    text: String,

    #[allow(dead_code)]
    words: Vec<SubtitleWord>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SubtitleWord {
    #[allow(dead_code)]
    text: String,

    #[allow(dead_code)]
    start_time: f64,

    #[allow(dead_code)]
    end_time: f64,
}

// ======================================================
// HELPERS
// ======================================================

fn seconds_to_ass_time(seconds: f64) -> String {
    let total_centiseconds =
        (seconds.max(0.0) * 100.0).round() as u64;

    let hours = total_centiseconds / 360000;
    let minutes = (total_centiseconds % 360000) / 6000;
    let secs = (total_centiseconds % 6000) / 100;
    let centiseconds = total_centiseconds % 100;

    format!(
        "{}:{:02}:{:02}.{:02}",
        hours,
        minutes,
        secs,
        centiseconds
    )
}

// ======================================================
// COLOR
// ======================================================
//
// CSS:
// #RRGGBB
//
// ASS:
// &HAABBGGRR
//
// ======================================================

fn hex_to_ass_color(hex: &str) -> String {
    let cleaned = hex.trim().trim_start_matches('#');

    if cleaned.len() != 6 {
        return "&H00FFFFFF".to_string();
    }

    let r = &cleaned[0..2];
    let g = &cleaned[2..4];
    let b = &cleaned[4..6];

    format!("&H00{}{}{}", b, g, r)
}

// ======================================================
// ASS TEXT ESCAPING
// ======================================================

fn escape_ass_text(text: &str) -> String {
    text
        .replace('\\', r"\\")
        .replace('{', r"\{")
        .replace('}', r"\}")
        .replace('\n', r"\N")
}

// ======================================================
// FFMPEG FILTER PATH ESCAPING
// ======================================================

fn escape_ffmpeg_filter_path(path: &str) -> String {
    path
        .replace('\\', r"\\")
        .replace(':', r"\:")
        .replace('\'', r"\'")
}

// ======================================================
// VIDEO DIMENSIONS
// ======================================================

async fn get_video_dimensions(
    app: &tauri::AppHandle,
    input_path: &str,
) -> Result<(i32, i32), String> {
    let sidecar = app
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| {
            format!(
                "Failed to create FFmpeg sidecar: {e}"
            )
        })?;

    let args = vec![
        "-i".to_string(),
        input_path.to_string(),

        "-f".to_string(),
        "null".to_string(),

        "-".to_string(),
    ];

    let output = sidecar
        .args(args)
        .output()
        .await
        .map_err(|e| {
            format!(
                "Failed to inspect video: {e}"
            )
        })?;

    let stderr =
        String::from_utf8_lossy(&output.stderr);

    println!("========== VIDEO INFO ==========");
    println!("{}", stderr);

    for line in stderr.lines() {
        if !line.contains("Video:") {
            continue;
        }

        for part in line.split_whitespace() {
            if let Some((width, height)) =
                part.split_once('x')
            {
                let width = width
                    .trim_matches(|c: char| {
                        !c.is_ascii_digit()
                    })
                    .parse::<i32>();

                let height = height
                    .trim_matches(|c: char| {
                        !c.is_ascii_digit()
                    })
                    .parse::<i32>();

                if let (Ok(width), Ok(height)) =
                    (width, height)
                {
                    if width > 0 && height > 0 {
                        println!(
                            "Detected video dimensions: {}x{}",
                            width,
                            height
                        );

                        return Ok((width, height));
                    }
                }
            }
        }
    }

    Err(
        "Could not determine video dimensions."
            .to_string(),
    )
}

// ======================================================
// GENERATE ASS
// ======================================================

fn generate_ass(
    subtitles: &[Subtitle],
    style: &CaptionStyle,
    video_width: i32,
    video_height: i32,
) -> String {
    // ==================================================
    // EDITOR REFERENCE
    // ==================================================

    let reference_width = 1080.0;
    let reference_height = 1920.0;

    let scale_x =
        video_width as f64 / reference_width;

    let scale_y =
        video_height as f64 / reference_height;

    let visual_scale = scale_x;

    // ==================================================
    // POSITION
    // ==================================================
    //
    // IMPORTANT:
    //
    // The React editor uses:
    //
    // left: positionX%
    // top: positionY%
    //
    // transform: translate(-50%, -50%)
    //
    // Therefore positionX and positionY are the CENTER
    // of the caption box.
    //
    // We preserve that EXACTLY here.
    // ==================================================

    let x = (
        style.position_x
            / 100.0
            * video_width as f64
    )
    .round()
    .clamp(
        0.0,
        video_width as f64,
    ) as i32;

    let y = (
        style.position_y
            / 100.0
            * video_height as f64
    )
    .round()
    .clamp(
        0.0,
        video_height as f64,
    ) as i32;

    println!("========== CAPTION POSITION ==========");
    println!("positionX: {}", style.position_x);
    println!("positionY: {}", style.position_y);
    println!("ASS X: {}", x);
    println!("ASS Y: {}", y);

    // ==================================================
    // MAX WIDTH
    // ==================================================

    let max_width_percent =
        style.max_width.clamp(1.0, 100.0);

    let max_width = (
        max_width_percent
            / 100.0
            * video_width as f64
    )
    .round()
    .max(1.0) as i32;

    println!(
        "Max width: {}% -> {}px",
        max_width_percent,
        max_width
    );

    // ==================================================
    // FONT
    // ==================================================
    //
    // DO NOT CHANGE THIS.
    // ==================================================

    let font_size = (
        (style.font_size * 1.5)
            * visual_scale
    )
    .max(1.0);

    let bold =
        if style.font_weight >= 600 {
            -1
        } else {
            0
        };

    // ==================================================
    // COLORS
    // ==================================================

    let primary_color =
        hex_to_ass_color(
            &style.color
        );

    let outline_color =
        hex_to_ass_color(
            &style.stroke_color
        );

    let shadow_color =
        hex_to_ass_color(
            &style.shadow_color
        );

    // ==================================================
    // STROKE
    // ==================================================

    let outline =
        (
            style.stroke_width
                * visual_scale
        )
        .max(0.0);

    // ==================================================
    // SHADOW
    // ==================================================

    let shadow =
        if style.shadow {
            (
                style.shadow_blur
                    * visual_scale
                    * 0.15
            )
            .clamp(0.0, 4.0)
        } else {
            0.0
        };

    // ==================================================
    // IMPORTANT:
    //
    // ALWAYS USE CENTER ANCHOR
    //
    // This means:
    //
    // \pos(x,y)
    //
    // always refers to the exact same point as:
    //
    // left: positionX%
    // transform: translateX(-50%)
    //
    // ==================================================

    let alignment = 5;

    // ==================================================
    // ASS
    // ==================================================

    let mut ass = String::new();

    ass.push_str("[Script Info]\n");
    ass.push_str("ScriptType: v4.00+\n");

    ass.push_str(&format!(
        "PlayResX: {}\n",
        video_width
    ));

    ass.push_str(&format!(
        "PlayResY: {}\n",
        video_height
    ));

    ass.push_str(
        "ScaledBorderAndShadow: yes\n"
    );

    ass.push_str(
        "WrapStyle: 1\n"
    );

    ass.push_str("\n");

    // ==================================================
    // STYLES
    // ==================================================

    ass.push_str(
        "[V4+ Styles]\n"
    );

    ass.push_str(
        "Format: Name, Fontname, Fontsize, \
         PrimaryColour, SecondaryColour, \
         OutlineColour, BackColour, Bold, \
         Italic, Underline, StrikeOut, \
         ScaleX, ScaleY, Spacing, Angle, \
         BorderStyle, Outline, Shadow, \
         Alignment, MarginL, MarginR, MarginV, \
         Encoding\n",
    );

    ass.push_str(
        &format!(
            "Style: Default,{},{:.2},{},{},{},{},{},0,0,0,100,100,0,0,1,{:.2},{:.2},{},0,0,0,1\n",
            style.font_family,
            font_size,
            primary_color,
            primary_color,
            outline_color,
            shadow_color,
            bold,
            outline,
            shadow,
            alignment,
        )
    );

    ass.push_str("\n");

    // ==================================================
    // EVENTS
    // ==================================================

    ass.push_str(
        "[Events]\n"
    );

    ass.push_str(
        "Format: Layer, Start, End, Style, Name, \
         MarginL, MarginR, MarginV, Effect, Text\n",
    );

    // ==================================================
    // SUBTITLES
    // ==================================================

    for subtitle in subtitles {
        let start =
            seconds_to_ass_time(
                subtitle.start_time
            );

        let end =
            seconds_to_ass_time(
                subtitle.end_time
            );

        let escaped_text =
            escape_ass_text(
                &subtitle.text
            );

        // ==================================================
        // ALIGNMENT
        // ==================================================
        //
        // We can't use ASS's \an4/\an6 because that would
        // change what x means.
        //
        // Instead we use the center anchor and modify the
        // text itself to simulate left/right alignment.
        //
        // For now:
        //
        // center = normal
        // left/right = use ASS alignment tags but compensate
        // the X coordinate.
        // ==================================================

        let (event_x, event_alignment) =
            match style.text_align.as_str() {
                "left" => {
                    // Move anchor to the LEFT edge of
                    // the max-width box.
                    let left_x =
                        x - max_width / 2;

                    (
                        left_x.clamp(
                            0,
                            video_width
                        ),
                        4
                    )
                }

                "right" => {
                    // Move anchor to the RIGHT edge of
                    // the max-width box.
                    let right_x =
                        x + max_width / 2;

                    (
                        right_x.clamp(
                            0,
                            video_width
                        ),
                        6
                    )
                }

                _ => {
                    (
                        x,
                        5
                    )
                }
            };

        // ==================================================
        // POSITION
        // ==================================================

        let positioned_text =
            format!(
                "{{\\an{}\\pos({},{})\\q1}}{}",
                event_alignment,
                event_x,
                y,
                escaped_text
            );

        // ==================================================
        // IMPORTANT:
        //
        // Give ASS the maximum width as the horizontal
        // margins of the event.
        // ==================================================

        let margin_left =
            if style.text_align == "right" {
                0
            } else {
                (event_x - max_width)
                    .max(0)
            };

        let margin_right =
            if style.text_align == "left" {
                0
            } else {
                (
                    video_width
                        - event_x
                        - max_width
                )
                .max(0)
            };

        ass.push_str(
            &format!(
                "Dialogue: 0,{},{},Default,,{},{},0,,{}\n",
                start,
                end,
                margin_left,
                margin_right,
                positioned_text
            )
        );
    }

    ass
}

// ======================================================
// EXPORT VIDEO
// ======================================================

#[tauri::command]
async fn export_video(
    app: tauri::AppHandle,
    input_path: String,
    output_path: String,
    subtitles: String,
    style: CaptionStyle,
) -> Result<String, String> {
    println!(
        "======================================"
    );

    println!("🎬 EXPORT STARTED");

    println!(
        "======================================"
    );

    println!(
        "Input: {}",
        input_path
    );

    println!(
        "Output: {}",
        output_path
    );

    // ==================================================
    // VIDEO DIMENSIONS
    // ==================================================

    let (
        video_width,
        video_height
    ) =
        get_video_dimensions(
            &app,
            &input_path,
        )
        .await?;

    println!(
        "Video dimensions: {}x{}",
        video_width,
        video_height
    );

    // ==================================================
    // PARSE SUBTITLES
    // ==================================================

    let parsed_subtitles:
        Vec<Subtitle> =
        serde_json::from_str(
            &subtitles
        )
        .map_err(|e| {
            format!(
                "Failed to parse subtitles: {e}"
            )
        })?;

    println!(
        "Subtitle count: {}",
        parsed_subtitles.len()
    );

    // ==================================================
    // GENERATE ASS
    // ==================================================

    let ass_content =
        generate_ass(
            &parsed_subtitles,
            &style,
            video_width,
            video_height,
        );

    println!(
        "Generated ASS subtitle file."
    );

    // ==================================================
    // TEMP ASS FILE
    // ==================================================

    let temp_dir =
        std::env::temp_dir();

    let ass_path: PathBuf =
        temp_dir.join(
            format!(
                "caps_subtitles_{}.ass",
                uuid::Uuid::new_v4()
            )
        );

    fs::write(
        &ass_path,
        &ass_content,
    )
    .map_err(|e| {
        format!(
            "Failed to create temporary subtitle file: {e}"
        )
    })?;

    println!(
        "ASS file: {}",
        ass_path.display()
    );

    // ==================================================
    // FFMPEG FILTER
    // ==================================================

    let ass_path_string =
        ass_path
            .to_string_lossy()
            .to_string();

    let escaped_ass_path =
        escape_ffmpeg_filter_path(
            &ass_path_string
        );

    // Keep your slight brightness increase.
    let filter = format!(
        "eq=brightness=0.030,subtitles='{}'",
        escaped_ass_path
    );

    println!(
        "FFmpeg filter:"
    );

    println!(
        "{}",
        filter
    );

    // ==================================================
    // FFMPEG SIDECAR
    // ==================================================

    let sidecar = app
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| {
            format!(
                "Failed to create FFmpeg sidecar: {e}"
            )
        })?;

    let args = vec![
        "-y".to_string(),

        "-i".to_string(),
        input_path,

        "-vf".to_string(),
        filter,

        "-c:v".to_string(),
        "libx264".to_string(),

        "-preset".to_string(),
        "medium".to_string(),

        "-crf".to_string(),
        "18".to_string(),

        "-c:a".to_string(),
        "aac".to_string(),

        "-b:a".to_string(),
        "192k".to_string(),

        output_path.clone(),
    ];

    println!(
        "======================================"
    );

    println!(
        "FFMPEG COMMAND"
    );

    println!(
        "======================================"
    );

    println!(
        "{:?}",
        args
    );

    // ==================================================
    // EXECUTE
    // ==================================================

    let output =
        sidecar
            .args(args)
            .output()
            .await
            .map_err(|e| {
                format!(
                    "Failed to start FFmpeg: {e}"
                )
            })?;

    println!(
        "FFmpeg finished."
    );

    println!(
        "Status: {:?}",
        output.status
    );

    if !output.stdout.is_empty() {
        println!(
            "FFmpeg stdout:\n{}",
            String::from_utf8_lossy(
                &output.stdout
            )
        );
    }

    if !output.stderr.is_empty() {
        println!(
            "FFmpeg stderr:\n{}",
            String::from_utf8_lossy(
                &output.stderr
            )
        );
    }

    // ==================================================
    // CHECK RESULT
    // ==================================================

    if !output.status.success() {
        let _ =
            fs::remove_file(
                &ass_path
            );

        return Err(
            format!(
                "FFmpeg failed with status {:?}:\n{}",
                output.status.code(),
                String::from_utf8_lossy(
                    &output.stderr
                )
            )
        );
    }

    // ==================================================
    // CLEANUP
    // ==================================================

    if let Err(error) =
        fs::remove_file(
            &ass_path
        )
    {
        println!(
            "⚠️ Could not remove temporary ASS file: {}",
            error
        );
    }

    println!(
        "======================================"
    );

    println!(
        "✅ EXPORT COMPLETE"
    );

    println!(
        "======================================"
    );

    Ok(output_path)
}

// ======================================================
// GREET
// ======================================================

#[tauri::command]
fn greet(
    name: &str
) -> String {
    format!(
        "Hello, {}! You've been greeted from Rust!",
        name
    )
}

// ======================================================
// TAURI
// ======================================================

#[cfg_attr(
    mobile,
    tauri::mobile_entry_point
)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_fs::init()
        )
        .plugin(
            tauri_plugin_persisted_scope::init()
        )
        .plugin(
            tauri_plugin_dialog::init()
        )
        .plugin(
            tauri_plugin_shell::init()
        )
        .invoke_handler(
            tauri::generate_handler![
                greet,
                export_video
            ]
        )
        .run(
            tauri::generate_context!()
        )
        .expect(
            "error while running Tauri application"
        );
}