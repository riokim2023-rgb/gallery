import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, style, lineWeight, detailLevel, width, height } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API Key is not configured on the server." },
        { status: 500 }
      );
    }

    // 1. Send the base64 image to gpt-4o-mini to get a structural description
    let sceneDescription = "A scenic urban setting";
    try {
      const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Describe the architectural elements, layout, perspective, and key objects in this image in detail. Focus strictly on geometry, shapes, and structural composition for a sketch drawing. Do not describe colors or artistic styles. Keep the description under 100 words.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: image, // base64 data URL (e.g. data:image/jpeg;base64,...)
                  },
                },
              ],
            },
          ],
          max_tokens: 150,
        }),
      });

      const gptData = await gptResponse.json();
      if (gptResponse.ok && gptData.choices?.[0]?.message?.content) {
        sceneDescription = gptData.choices[0].message.content.trim();
        console.log("Scene description generated:", sceneDescription);
      } else {
        console.warn("gpt-4o-mini vision failed, using fallback description:", gptData.error || gptData);
      }
    } catch (e) {
      console.warn("Error calling gpt-4o-mini vision:", e);
    }

    // 2. Map user parameters into prompt modifiers
    let stylePrompt = "vibrant and warm watercolor painting, colorful travel sketchbook drawing, soft watercolor washes and sunlight bleeds";
    let colorScheme = "vibrant and warm watercolor colors, bright sunny tones";
    let bgStyle = "white paper background";
    
    if (style === "연필 드로잉") {
      stylePrompt = "pencil sketch drawing, realistic shading, graphite pencil lines, hand-drawn graphite art";
      colorScheme = "monochrome black and white fine art, grayscale, no color";
      bgStyle = "white sketch paper background";
    } else if (style === "아크릴화") {
      stylePrompt = "heavy acrylic painting style, visible thick textured brush strokes, heavy impasto paint texture, rough paint layers, artistic fine art oil-like painting";
      colorScheme = "deep, rich, intense, and saturated colors";
      bgStyle = "heavy artist canvas texture background";
    }

    let linePrompt = "medium lines";
    if (lineWeight === "얇게") {
      linePrompt = "thin delicate lines, sharp details";
    } else if (lineWeight === "굵게") {
      linePrompt = "thick bold strokes, strong structural outlines";
    }

    let detailPrompt = "balanced details";
    if (detailLevel === "간단하게") {
      detailPrompt = "simple minimalist sketch composition";
    } else if (detailLevel === "상세하게") {
      detailPrompt = "highly detailed artwork, intricate textures and layers";
    }

    const finalPrompt = `Convert this scene into a high quality art piece. 
Style: ${stylePrompt}. 
Color scheme: ${colorScheme}.
Lines: ${linePrompt}, level: ${detailPrompt}. 
Perspective: realistic perspective, composition: clean composition, background: ${bgStyle}.
Scene content: ${sceneDescription}`;

    // Calculate target size for gpt-image models (supports dynamic aspect ratio)
    let targetSize = "1024x1024";
    if (width && height) {
      const r = width / height;
      // Target area of ~1,048,576 pixels (similar to 1024x1024)
      let targetW = Math.sqrt(1048576 * r);
      let targetH = targetW / r;
      
      // Round to nearest multiple of 16
      let w16 = Math.round(targetW / 16) * 16;
      let h16 = Math.round(targetH / 16) * 16;
      
      // Enforce minimum / maximum dimensions
      if (w16 < 384) w16 = 384;
      if (h16 < 384) h16 = 384;
      if (w16 > 2000) {
        w16 = 2000;
        h16 = Math.round((2000 / r) / 16) * 16;
      }
      if (h16 > 2000) {
        h16 = 2000;
        w16 = Math.round((2000 * r) / 16) * 16;
      }
      
      targetSize = `${w16}x${h16}`;
      console.log(`Dynamic target size computed: ${targetSize} (original: ${width}x${height}, ratio: ${r})`);
    }

    // Helper for DALL-E 3 supported sizes
    let dalle3Size = "1024x1024";
    if (width && height) {
      const r = width / height;
      if (r > 1.2) {
        dalle3Size = "1792x1024";
      } else if (r < 0.8) {
        dalle3Size = "1024x1792";
      }
    }

    // Convert base64 data URL to Blob/Buffer for the edits endpoint
    const mimeTypeMatch = image.match(/^data:([^;]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/png";
    const base64Data = image.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const blob = new Blob([buffer], { type: mimeType });

    // 3. Try to use image-to-image Edits endpoint first (for gpt-image-1 and gpt-image-2)
    // This maintains the original composition and geometry of the uploaded photo.
    const editPrompt = `Convert this entire photo into a high quality art piece. Style: ${stylePrompt}. Color scheme: ${colorScheme}. Lines: ${linePrompt}, level: ${detailPrompt}. Background: ${bgStyle}. Do not add any new buildings, objects, or people, just transform the entire image style.`;
    
    const editModels = ["gpt-image-1", "gpt-image-2"];
    for (const model of editModels) {
      try {
        console.log(`Attempting image-to-image style transfer using edits endpoint with model: ${model} and size: ${targetSize}`);
        
        const formData = new FormData();
        formData.append("image", blob, "source_image.png");
        formData.append("model", model);
        formData.append("prompt", editPrompt);
        formData.append("size", targetSize);

        const response = await fetch("https://api.openai.com/v1/images/edits", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        });

        const data = await response.json();
        if (response.ok && data.data?.[0]) {
          const item = data.data[0];
          if (item.url) {
            console.log(`Successfully generated sketch using edits with ${model} (URL format)`);
            return NextResponse.json({ url: item.url });
          } else if (item.b64_json) {
            console.log(`Successfully generated sketch using edits with ${model} (Base64 format)`);
            return NextResponse.json({ url: `data:image/png;base64,${item.b64_json}` });
          }
        } else {
          console.warn(`Edits endpoint failed for model ${model}:`, data.error || data);
        }
      } catch (e) {
        console.warn(`Error using edits endpoint with model ${model}:`, e);
      }
    }

    // 4. Try generating the sketch using text-to-image generations as fallback
    const modelsToTry = ["gpt-image-1", "gpt-image-2", "dall-e-3", "dall-e-2"];
    let lastError = "Failed to generate image from all models.";

    for (const model of modelsToTry) {
      try {
        // Map size according to what is supported by the model
        let currentSize = targetSize;
        if (model === "dall-e-3") {
          currentSize = dalle3Size;
        } else if (model === "dall-e-2") {
          currentSize = "1024x1024";
        }

        console.log(`Attempting image generation with model: ${model} and size: ${currentSize}`);
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            prompt: finalPrompt,
            n: 1,
            size: currentSize,
          }),
        });

        const data = await response.json();
        if (response.ok && data.data?.[0]) {
          const item = data.data[0];
          if (item.url) {
            console.log(`Successfully generated image using model: ${model} (URL format)`);
            return NextResponse.json({ url: item.url });
          } else if (item.b64_json) {
            console.log(`Successfully generated image using model: ${model} (Base64 format)`);
            return NextResponse.json({ url: `data:image/png;base64,${item.b64_json}` });
          }
        } else {
          lastError = data.error?.message || `Model ${model} failed with status ${response.status}`;
          console.warn(`Model ${model} failed:`, data.error || data);
        }
      } catch (e: any) {
        lastError = e.message || `Error calling model ${model}`;
        console.warn(`Error with model ${model}:`, e);
      }
    }

    return NextResponse.json(
      { error: lastError },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Image conversion API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
