import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SRC = "/Users/deepakpatil/deepakpatil";
const OUT = "src";

// ---------- helpers ----------
const read = (p) => readFileSync(`${SRC}/${p}`, "utf8");

function extractMain(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!m) throw new Error("no <main> found");
  return m[1].replace(/^\s*\n/, "");
}

// Extract content between a `<div class="prose prose-lg max-w-none">` and its
// matching `</div>` by balancing div tags.
function extractProse(html) {
  const open = html.indexOf('class="prose prose-lg max-w-none"');
  if (open === -1) throw new Error("no prose div found");
  const start = html.indexOf(">", open) + 1;
  let depth = 1;
  let i = start;
  const re = /<div[\s>]|<\/div>/g;
  re.lastIndex = start;
  let m;
  while ((m = re.exec(html))) {
    if (m[0] === "</div>") depth--;
    else depth++;
    if (depth === 0) {
      i = m.index;
      break;
    }
  }
  return html.slice(start, i).replace(/\n {20,}\n/g, "\n\n").trim();
}

function extractTag(html, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const m = html.match(re);
  return m ? m[1].trim() : "";
}

function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/);
  return m ? m[1].trim() : "";
}

function extractMeta(html, name) {
  const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`);
  const m = html.match(re);
  return m ? m[1].trim() : "";
}

function extractJsonLd(html) {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  return m ? m[1].trim() : null;
}

// Rewrite relative .html URLs into clean Eleventy URLs.
function fixLinks(html) {
  return html
    .replace(/(href|src)="((?:\.\.\/)*)index\.html"/g, '$1="/"')
    .replace(/(href|src)="((?:\.\.\/)*)(about|work|contact|blog|privacy-policy|terms-conditions)\.html"/g, '$1="/$3/"')
    .replace(/(href)="((?:\.\.\/)*)(event-driven-serverless-pipeline|ai-document-summarizer-chat)\.html"/g, '$1="/$3/"')
    .replace(/(href)="((?:\.\.\/)*)blog\/([^"]+)\.html"/g, '$1="/blog/$3/"')
    .replace(/window\.location\.href='((?:\.\.\/)*)(blog\/)?([^']+)\.html'/g,
      (m, pre, isBlog, name) => `window.location.href='${isBlog ? "/blog/" : "/"}${name}/'`)
    .replace(/(src)="((?:\.\.\/)*)(images\/[^"]+)"/g, '$1="/$3"')
    .replace(/(src)="((?:\.\.\/)*)Photo\.jpg"/g, '$1="/Photo.jpg"')
    .replace(/(href)="((?:\.\.\/)*)#([^"]+)"/g, '$1="#$3"')
    .replace(/(src|href)="((?:\.\.\/)*)mailto:([^"]+)"/g, '$1="mailto:$3"')
    .replace(/(src|href)="((?:\.\.\/)*)(https?:\/\/[^"]+)"/g, '$1="$3"');
}

// ---------- YAML block scalar for multi-line JSON-LD ----------
function yamlBlock(str) {
  return str.split("\n").map((l) => `  ${l}`).join("\n");
}

// ---------- front matter builder ----------
function fm(entries) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(entries)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string") {
      if (k === "jsonld") {
        lines.push(`${k}: |`);
        lines.push(yamlBlock(v));
      } else {
        lines.push(`${k}: "${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
      }
    } else {
      lines.push(`${k}: ${v}`);
    }
  }
  lines.push("---", "");
  return lines.join("\n");
}

// ============================================================
// 1. TOP-LEVEL PAGES (extract <main>, keep as .njk)
// ============================================================
const topPages = [
  {
    file: "index.html", out: "index.njk",
    meta: {
      layout: "layouts/base.njk",
      activeNav: "index",
      title: "Deepak Patil",
      ogTitle: "Deepak Patil - Senior Digital Engineer | Cloud Architecture & DevOps Expert",
      description: "Experienced Digital Engineer specializing in cloud architecture, DevOps, and full-stack development. Expert in AWS, Terraform, CI/CD pipelines, and modern web technologies. Available for consulting and project collaboration.",
      keywords: "Digital Engineer, Cloud Architecture, DevOps, AWS, Terraform, CI/CD, Full Stack Developer, Software Engineer, Cloud Consultant, Infrastructure as Code, Kubernetes, Docker, React, Node.js, Python, JavaScript",
      ogImage: "/images/og-image.jpg",
      ogImageAlt: "Deepak Patil - Digital Engineer Portfolio"
    }
  },
  {
    file: "about.html", out: "about.njk",
    meta: {
      layout: "layouts/base.njk",
      activeNav: "about",
      title: "About Deepak Patil | Senior Digital Engineer & Cloud Architecture Expert",
      description: "Learn about Deepak Patil, a Senior Digital Engineer specializing in cloud architecture, DevOps, and full-stack development. Expert in AWS, Terraform, CI/CD pipelines, and modern web technologies.",
      keywords: "About Deepak Patil, Digital Engineer, Cloud Architecture Expert, DevOps Engineer, AWS Expert, Terraform Specialist, Full Stack Developer, Software Engineer, Cloud Consultant",
      ogImage: "/images/about-og-image.jpg",
      ogImageAlt: "Deepak Patil - About"
    }
  },
  {
    file: "work.html", out: "work.njk",
    meta: {
      layout: "layouts/base.njk",
      activeNav: "work",
      title: "Portfolio Projects - Deepak Patil | Cloud Architecture & DevOps Portfolio",
      description: "Explore Deepak Patil's portfolio of cloud architecture and DevOps projects. Featuring AWS, Terraform, CI/CD pipelines, and modern web technologies. View detailed case studies and technical implementations.",
      keywords: "Portfolio, Cloud Architecture Projects, DevOps Projects, AWS Projects, Terraform Projects, CI/CD Projects, Full Stack Development, Software Engineering Portfolio, Cloud Consultant Projects",
      ogImage: "/images/work-og-image.jpg",
      ogImageAlt: "Deepak Patil Portfolio Projects"
    }
  },
  {
    file: "blog.html", out: "blog.raw",
    meta: {
      layout: "layouts/base.njk",
      activeNav: "blog",
      title: "Tech Blog - Deepak Patil | DevOps, Cloud Architecture & Engineering Insights",
      description: "Read Deepak Patil's technical blog covering DevOps, cloud architecture, Terraform, CI/CD pipelines, Git, and modern engineering practices. Expert insights on AWS, infrastructure as code, and software development.",
      keywords: "Tech Blog, DevOps Blog, Cloud Architecture Blog, Terraform Tutorial, CI/CD Guide, Git Tutorial, AWS Blog, Infrastructure as Code, Software Engineering Blog, Technical Writing, Engineering Insights",
      ogImage: "/images/blog-og-image.jpg",
      ogImageAlt: "Deepak Patil Tech Blog"
    }
  },
  {
    file: "contact.html", out: "contact.njk",
    meta: {
      layout: "layouts/base.njk",
      activeNav: "contact",
      bodyClass: "font-apple text-gray-900 bg-white",
      title: "Contact - Deepak Patil",
      description: "Get in touch with Deepak Patil for cloud architecture, DevOps, and infrastructure consulting. Expert in AWS, Terraform, CI/CD pipelines, and modern cloud technologies.",
      keywords: "Contact, Cloud Architecture, DevOps, AWS, Terraform, CI/CD, Infrastructure Consulting, Cloud Migration, DevOps Implementation",
      ogImage: "/images/og-image.jpg",
      ogImageAlt: "Contact Deepak Patil - Cloud Architecture & DevOps Expert"
    }
  },
  {
    file: "404.html", out: "404.njk",
    meta: {
      layout: "layouts/base.njk",
      nav: "simple",
      permalink: "/404.html",
      bodyClass: "font-apple bg-white text-black antialiased",
      title: "404 - Page Not Found | Deepak Patil",
      description: "The page you're looking for doesn't exist. Return to Deepak Patil's portfolio to explore cloud architecture and DevOps projects.",
      robots: "noindex, nofollow"
    }
  },
  {
    file: "privacy-policy.html", out: "privacy-policy.njk",
    meta: {
      layout: "layouts/base.njk",
      nav: "simple",
      title: "Privacy Policy - Deepak Patil",
      description: "Privacy Policy for Deepak Patil's portfolio website. Learn how we collect, use, and protect your personal information.",
      twitterCard: "summary"
    }
  },
  {
    file: "terms-conditions.html", out: "terms-conditions.njk",
    meta: {
      layout: "layouts/base.njk",
      nav: "simple",
      title: "Terms & Conditions - Deepak Patil",
      description: "Terms and Conditions for Deepak Patil's portfolio website.",
      twitterCard: "summary"
    }
  },
  {
    file: "event-driven-serverless-pipeline.html", out: "event-driven-serverless-pipeline.njk",
    meta: {
      layout: "layouts/base.njk",
      activeNav: "work",
      title: "Event-Driven Serverless Pipeline for Unstructured Data on AWS - Deepak Patil",
      description: "A comprehensive cloud-native system to store, analyze, and visualize personal files, notes, and media usage with automated tagging, search, and reporting capabilities.",
      ogImage: "/images/project-og-image.jpg",
      ogImageAlt: "Event-Driven Serverless Pipeline Project"
    }
  },
  {
    file: "ai-document-summarizer-chat.html", out: "ai-document-summarizer-chat.njk",
    meta: {
      layout: "layouts/base.njk",
      activeNav: "work",
      title: "AI-Powered Document Summarizer & Chat – Serverless RAG System on AWS - Deepak Patil",
      description: "Upload any document and instantly chat with it. Built with AWS Bedrock, Lambda, and DynamoDB — fully serverless and scalable RAG system for intelligent document interaction.",
      ogImage: "/images/ai-document-chat-og-image.jpg",
      ogImageAlt: "AI-Powered Document Summarizer & Chat Project"
    }
  }
];

for (const page of topPages) {
  const html = read(page.file);
  const main = fixLinks(extractMain(html));

  const entries = { ...page.meta };

  // Pull JSON-LD from index + blog automatically
  const jsonld = extractJsonLd(html);
  if (jsonld) entries.jsonld = jsonld;

  // Blog listing is hand-written (dynamic grid), only dump extracted main for reference
  if (page.out === "blog.raw") {
    writeFileSync("scripts/blog.main.raw.html", main);
    continue;
  }

  writeFileSync(`${OUT}/${page.out}`, fm(entries) + main + "\n");
  console.log(`  ${page.file} -> ${page.out}`);
}

// ============================================================
// 2. BLOG POSTS (extract prose, keep as .html with post layout)
// ============================================================
const posts = [
  { slug: "terraform-mastering-infrastructure-as-code", category: "DevOps & Cloud", date: "2025-10-01", readTime: 15, image: "/images/terraform-guide.png", cardTitle: "Terraform: Mastering Infrastructure as Code", excerpt: "Learn how to manage cloud infrastructure with Terraform. From basic concepts to advanced patterns, discover how Infrastructure as Code can transform your DevOps workflow and make your infrastructure reliable, repeatable, and scalable.", order: 1 },
  { slug: "cicd-pipelines-complete-guide", category: "DevOps & Cloud", date: "2025-10-01", readTime: 18, image: "/images/cicid-guide.png", cardTitle: "CI/CD Pipelines: The Complete Guide to Modern DevOps", excerpt: "Master Continuous Integration and Continuous Deployment with this comprehensive guide. Learn how to build robust, automated pipelines that accelerate development, improve quality, and reduce deployment risks in modern software development.", order: 2 },
  { slug: "git-complete-guide", category: "Development", date: "2025-10-01", readTime: 20, image: "/images/git-complete-guide.png", cardTitle: "Git: The Complete Guide to Version Control Mastery", excerpt: "Master Git from the ground up with this comprehensive guide. Learn essential commands, branching strategies, collaboration workflows, and advanced techniques that will transform how you manage code and collaborate with teams.", order: 3 },
  { slug: "how-to-design-highly-available-cloud-systems", category: "DevOps & Cloud", date: "2025-10-04", readTime: 15, image: "/images/Build_high_available-system.png", cardTitle: "How to Design Highly Available Cloud Systems: Lessons from AWS", excerpt: "Master the art of building resilient cloud architectures with AWS. Learn essential HA concepts including multi-AZ deployments, retry patterns, idempotency, and dead letter queues to create systems that can withstand failures and maintain business continuity.", order: 4 },
  { slug: "linux-commands-complete-guide", category: "Development", date: "2025-10-09", readTime: 25, image: null, cardTitle: "Linux Commands: The Complete Guide", excerpt: "Master Linux with this comprehensive guide covering 100+ essential Linux commands with detailed examples. From basic file operations to advanced system administration, this guide will transform your Linux skills.", order: 5 },
  { slug: "how-to-build-observability-stack", category: "DevOps & Cloud", date: "2025-10-25", readTime: 12, image: "/images/how-to-build-an-observability-stack.png", cardTitle: "How to Build an Observability Stack (Logs, Metrics, Tracing) for Your Cloud-Native App", excerpt: "Learn how to build a comprehensive observability stack for cloud-native applications. Master logs, metrics, and tracing with Prometheus, Loki, Jaeger, and OpenTelemetry. Complete guide with real-world examples and best practices.", order: 6 },
  { slug: "using-ai-to-triage-logs", category: "DevOps & Cloud", date: "2026-07-10", readTime: 15, image: "/images/ai-log-triage.png", cardTitle: "Using AI to Triage Logs: Reducing Alert Fatigue", excerpt: "Explore the intersection of observability and AIOps—using LLMs and specialized clustering tools to aggregate thousands of logs, eliminate alert fatigue, and automate root cause analysis.", order: 7 },
  { slug: "kubernetes-ultimate-guide", category: "DevOps & Cloud", date: "2025-10-01", readTime: 12, image: "/images/Kubernatics-guide.png", cardTitle: "Kubernetes: The Ultimate Guide to Container Orchestration", excerpt: "Master Kubernetes from the ground up with this comprehensive guide. Learn container orchestration, deployment strategies, and production best practices that will transform your DevOps workflow.", featured: true, order: 0 }
];

mkdirSync(`${OUT}/blog`, { recursive: true });

for (const post of posts) {
  const html = read(`blog/${post.slug}.html`);
  const prose = fixLinks(extractProse(html));
  const h1 = extractTag(html, "h1");
  const metaDesc = extractMeta(html, "description");

  const entries = {
    layout: "layouts/post.njk",
    title: h1 || post.cardTitle,
    cardTitle: post.cardTitle,
    excerpt: post.excerpt,
    category: post.category,
    date: post.date,
    readTime: post.readTime,
    description: metaDesc || post.excerpt,
    tags: ["post"],
    order: post.order
  };
  if (post.image) entries.image = post.image;
  if (post.featured) entries.featured = true;

  writeFileSync(`${OUT}/blog/${post.slug}.html`, fm(entries) + prose + "\n");
  console.log(`  blog/${post.slug}.html -> blog/${post.slug}.html`);
}

console.log("Done.");
