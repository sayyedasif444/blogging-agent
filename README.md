# Dev & Debate - AI Blog Generator

A powerful Next.js application that generates high-quality blog posts using AI. Features include:

- **AI-Powered Content Generation**: Uses OpenAI GPT-4 to create engaging blog content
- **Async Processing**: Real-time progress tracking with background job processing
- **Quality Evaluation**: AI-powered content rating and improvement suggestions
- **Image Integration**: Automatic relevant image suggestions via Pexels API
- **Customizable Settings**: Tone, length, and structure options
- **Multiple Export Formats**: PDF and HTML download options
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Features

- 🚀 **Async Blog Generation**: Non-blocking blog creation with real-time progress
- 📊 **Quality Assessment**: AI evaluates and improves content quality
- 🖼️ **Image Suggestions**: Automatically finds relevant images for your blog
- ⚙️ **Customizable**: Choose tone, length, and structure preferences
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- 🔄 **Real-time Updates**: Live progress tracking during generation
- 📄 **Multiple Formats**: Download as PDF or HTML
- 🎯 **Length Control**: Short (600 words), Medium (1500 words), or Long (2000+ words)
- 📝 **Structure Options**: Include headings and conclusion sections

## Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key
- Pexels API key (optional, for image generation)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blogtool
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# Pexels API Key (optional, for image generation)
PEXELS_API_KEY=your_pexels_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Enter a Topic**: Describe what you want to write about
2. **Configure Settings**: 
   - **Tone**: Choose from Professional, Casual, Friendly, Formal, or Conversational
   - **Length**: Select Short (600 words), Medium (1500 words), or Long (2000+ words)
   - **Structure**: Toggle section headings and conclusion inclusion
3. **Generate**: Click "Generate Blog" to start the AI-powered creation
4. **Track Progress**: Watch real-time progress as the AI works
5. **Review Results**: Get your completed blog with quality rating and image suggestions
6. **Download**: Export as PDF or HTML format

## Blog Generation Settings

### Length Options
- **Short**: ~600 words - Perfect for quick reads and social media
- **Medium**: ~1500 words - Standard blog post length
- **Long**: ~2000+ words - Comprehensive, in-depth content

### Structure Options
- **Include Headings**: Adds `<h2>` section headings for better organization
- **Include Conclusion**: Adds a conclusion section with summary and call-to-action

### Tone Options
- **Professional**: Formal, business-like language
- **Casual**: Relaxed, conversational tone
- **Friendly**: Warm, approachable writing
- **Formal**: Academic or corporate style
- **Conversational**: Natural, dialogue-like flow

## API Endpoints

- `POST /api/generate-blog-async` - Start async blog generation
- `GET /api/blog-status/[trackingId]` - Check generation progress
- `POST /api/download-pdf` - Generate and download PDF
- `POST /api/download-html` - Generate and download HTML

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **AI**: OpenAI GPT-4
- **Images**: Pexels API
- **PDF Generation**: Puppeteer
- **Storage**: File-based job tracking

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-blog-async/     # Async blog generation
│   │   ├── blog-status/             # Job status tracking
│   │   ├── download-pdf/            # PDF generation
│   │   └── download-html/           # HTML generation
│   ├── blog-tool/                   # Main blog tool page
│   └── page.tsx                     # Landing page
├── components/
│   ├── ui/                          # shadcn/ui components
│   └── BlogCreationForm.tsx         # Main form component
└── lib/
    └── agents/                      # AI agent functions
        ├── getTrendingTopic.ts      # Title generation
        ├── writeBlogSections.ts     # Content writing (with length/structure control)
        ├── evaluateAndRateBlog.ts   # Quality assessment
        ├── rewriteBlog.ts           # Content improvement
        ├── generateImageSearchQuery.ts # Image search
        └── findRelevantImages.ts    # Image fetching
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Remember to set your environment variables in the Vercel dashboard!
