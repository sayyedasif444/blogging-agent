import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, content, wordCount, rating, images } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create HTML content with enhanced styling and images
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.7;
            color: #2d3748;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #4c51bf 0%, #667eea 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.8em;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header .subtitle {
            font-size: 1.1em;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .content-wrapper {
            padding: 40px;
        }
        
        .metadata {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 40px;
            border-left: 5px solid #4c51bf;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .metadata h3 {
            margin: 0 0 20px 0;
            color: #2d3748;
            font-size: 1.4em;
            font-weight: 600;
        }
        
        .metadata-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .metadata-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .metadata-item strong {
            color: #4a5568;
            font-weight: 600;
        }
        
        .rating {
            display: inline-flex;
            align-items: center;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 0.9em;
            box-shadow: 0 2px 4px rgba(72, 187, 120, 0.3);
        }
        
        .images-section {
            margin: 40px 0;
        }
        
        .images-section h3 {
            font-size: 1.5em;
            margin-bottom: 20px;
            color: #2d3748;
            font-weight: 600;
        }
        
        .images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .image-item {
            position: relative;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .image-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .image-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            display: block;
        }
        
        .image-caption {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.7));
            color: white;
            padding: 20px 15px 15px;
            font-size: 0.9em;
            font-weight: 500;
        }
        
        .blog-content {
            background: white;
            padding: 0;
            border-radius: 15px;
            overflow: hidden;
        }
        
        .blog-content h2 {
            color: #2d3748;
            font-size: 1.8em;
            margin: 30px 0 20px 0;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }
        
        .blog-content h3 {
            color: #4a5568;
            font-size: 1.4em;
            margin: 25px 0 15px 0;
            font-weight: 600;
        }
        
        .blog-content p {
            margin-bottom: 20px;
            text-align: justify;
            color: #4a5568;
            font-size: 1.05em;
        }
        
        .blog-content ul, .blog-content ol {
            margin: 20px 0;
            padding-left: 25px;
        }
        
        .blog-content li {
            margin-bottom: 8px;
            color: #4a5568;
        }
        
        .blog-content strong {
            color: #2d3748;
            font-weight: 600;
        }
        
        .blog-content a {
            color: #4c51bf;
            text-decoration: none;
            font-weight: 500;
        }
        
        .blog-content a:hover {
            text-decoration: underline;
        }
        
        .footer {
            background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
            color: white;
            padding: 30px;
            text-align: center;
            margin-top: 40px;
        }
        
        .footer p {
            margin: 0;
            font-size: 0.95em;
            opacity: 0.9;
        }
        
        .footer .brand {
            font-weight: 600;
            color: #63b3ed;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .header h1 {
                font-size: 2.2em;
            }
            
            .content-wrapper {
                padding: 20px;
            }
            
            .metadata-grid {
                grid-template-columns: 1fr;
            }
            
            .images-grid {
                grid-template-columns: 1fr;
            }
            
            .blog-content h2 {
                font-size: 1.6em;
            }
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .header {
                background: #4c51bf !important;
                -webkit-print-color-adjust: exact;
            }
            
            .metadata {
                background: #f7fafc !important;
                -webkit-print-color-adjust: exact;
            }
            
            .rating {
                background: #48bb78 !important;
                -webkit-print-color-adjust: exact;
            }
            
            .footer {
                background: #2d3748 !important;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <div class="subtitle">AI-Generated Blog Post</div>
        </div>
        
        <div class="content-wrapper">
            <div class="metadata">
                <h3>📊 Blog Information</h3>
                <div class="metadata-grid">
                    <div class="metadata-item">
                        <strong>📝 Word Count:</strong> ${wordCount || 'N/A'}
                    </div>
                    ${rating ? `<div class="metadata-item">
                        <strong>⭐ AI Quality Rating:</strong> <span class="rating">${rating.score}/10</span>
                    </div>` : ''}
                    <div class="metadata-item">
                        <strong>🤖 Generated by:</strong> Dev & Debate AI
                    </div>
                    <div class="metadata-item">
                        <strong>📅 Date:</strong> ${new Date().toLocaleDateString()}
                    </div>
                </div>
                ${rating ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <strong>📋 AI Review:</strong><br>
                    <p style="margin-top: 10px; font-style: italic; color: #4a5568;">${rating.review}</p>
                </div>` : ''}
            </div>
            
            ${images && images.length > 0 ? `
            <div class="images-section">
                <h3>🖼️ Suggested Images</h3>
                <div class="images-grid">
                    ${images.map((imageUrl: string, index: number) => `
                    <div class="image-item">
                        <img src="${imageUrl}" alt="Blog image ${index + 1}" loading="lazy">
                        <div class="image-caption">
                            Image ${index + 1} - Click to view full size
                        </div>
                    </div>
                    `).join('')}
                </div>
                <p style="text-align: center; color: #718096; font-size: 0.9em; margin-top: 20px;">
                    💡 Images are sourced from Pexels and are free to use. Click any image to view in full size.
                </p>
            </div>
            ` : ''}
            
            <div class="blog-content">
                ${content}
            </div>
        </div>
        
        <div class="footer">
            <p>Generated with <span class="brand">Dev & Debate AI Blog Generator</span> • ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
</body>
</html>`;

    // Return HTML as response
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html"`,
      },
    });

  } catch (error) {
    console.error('HTML generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to generate HTML', details: errorMessage },
      { status: 500 }
    );
  }
} 