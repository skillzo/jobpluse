import { createHash } from "crypto";
import { Skill } from "../entities/Job";

export interface ParsedSalary {
  min_salary?: number;
  max_salary?: number;
  currency?: string;
  pay_period?: "year" | "month" | "week" | "day" | "hour";
}

export interface ParsedLocation {
  city?: string;
  region?: string;
  country?: string;
  raw: string;
}

export class ParsingService {
  private readonly salaryPatterns = [
    // USD patterns
    {
      regex:
        /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*-\s*\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
      currency: "USD",
    },
    { regex: /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, currency: "USD" },
    {
      regex: /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|dollars?)/gi,
      currency: "USD",
    },

    // GBP patterns
    {
      regex:
        /£(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*-\s*£(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
      currency: "GBP",
    },
    { regex: /£(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, currency: "GBP" },
    {
      regex: /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:GBP|pounds?)/gi,
      currency: "GBP",
    },

    // NGN patterns
    {
      regex:
        /₦(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*-\s*₦(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
      currency: "NGN",
    },
    { regex: /₦(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, currency: "NGN" },
    {
      regex: /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:NGN|naira)/gi,
      currency: "NGN",
    },
  ];

  private readonly payPeriodPatterns = [
    { regex: /(?:per\s+)?(year|annual|annually)/gi, period: "year" as const },
    { regex: /(?:per\s+)?(month|monthly)/gi, period: "month" as const },
    { regex: /(?:per\s+)?(week|weekly)/gi, period: "week" as const },
    { regex: /(?:per\s+)?(day|daily)/gi, period: "day" as const },
    { regex: /(?:per\s+)?(hour|hourly)/gi, period: "hour" as const },
  ];

  private readonly locationPatterns = [
    {
      patterns: ["US", "USA", "United States", "America"],
      country: "United States",
    },
    {
      patterns: ["London", "UK", "United Kingdom", "England"],
      country: "United Kingdom",
    },
    {
      patterns: ["Nigeria", "Lagos", "Abuja", "Port Harcourt"],
      country: "Nigeria",
    },
  ];

  private readonly curatedSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Vue",
    "Angular",
    "Node.js",
    "Python",
    "Java",
    "C#",
    "C++",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "Scala",
    "Elixir",
    "Clojure",
    "Haskell",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "Terraform",
    "Ansible",
    "Jenkins",
    "GitLab",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Elasticsearch",
    "Cassandra",
    "DynamoDB",
    "GraphQL",
    "REST",
    "gRPC",
    "WebSocket",
    "Microservices",
    "Serverless",
    "CI/CD",
    "Machine Learning",
    "AI",
    "Data Science",
    "DevOps",
    "SRE",
    "Security",
    "Testing",
    "Agile",
    "Scrum",
    "Kanban",
    "Product Management",
    "UX/UI",
    "Design",
    "Mobile",
    "iOS",
    "Android",
    "Flutter",
    "React Native",
    "Xamarin",
    "Unity",
    "Unreal Engine",
    "Blockchain",
    "Web3",
    "Cryptocurrency",
    "NFT",
    "DeFi",
    "Smart Contracts",
    "Linux",
    "Windows",
    "macOS",
    "Shell",
    "Bash",
    "PowerShell",
    "Git",
    "SVN",
    "HTML",
    "CSS",
    "Sass",
    "Less",
    "Bootstrap",
    "Tailwind",
    "Material-UI",
    "Ant Design",
    "Express",
    "FastAPI",
    "Django",
    "Flask",
    "Spring",
    "Laravel",
    "Rails",
    "ASP.NET",
    "Jest",
    "Mocha",
    "Chai",
    "Cypress",
    "Selenium",
    "Playwright",
    "Puppeteer",
    "Webpack",
    "Vite",
    "Rollup",
    "Parcel",
    "Babel",
    "ESLint",
    "Prettier",
    "Husky",
    "Nginx",
    "Apache",
    "CDN",
    "Load Balancing",
    "Caching",
    "Performance",
    "SEO",
    "Analytics",
    "Monitoring",
    "Logging",
    "Alerting",
    "Metrics",
    "APM",
    "Sentry",
  ];

  parseSalary(text: string): ParsedSalary {
    const result: ParsedSalary = {};

    // Find salary patterns
    for (const pattern of this.salaryPatterns) {
      const matches = Array.from(text.matchAll(pattern.regex));
      if (matches.length > 0) {
        const match = matches[0];
        result.currency = pattern.currency;

        if (match[2]) {
          // Range found
          result.min_salary = this.parseNumber(match[1]);
          result.max_salary = this.parseNumber(match[2]);
        } else {
          // Single value found
          result.min_salary = this.parseNumber(match[1]);
        }
        break;
      }
    }

    // Find pay period
    for (const pattern of this.payPeriodPatterns) {
      if (pattern.regex.test(text)) {
        result.pay_period = pattern.period;
        break;
      }
    }

    // Infer pay period if not found
    if (!result.pay_period) {
      if (result.min_salary && result.min_salary > 100000) {
        result.pay_period = "year";
      } else if (result.min_salary && result.min_salary > 10000) {
        result.pay_period = "month";
      } else if (result.min_salary && result.min_salary > 100) {
        result.pay_period = "hour";
      }
    }

    return result;
  }

  parseLocation(text: string): ParsedLocation {
    const result: ParsedLocation = { raw: text };

    // Check against known patterns
    for (const pattern of this.locationPatterns) {
      for (const locationPattern of pattern.patterns) {
        if (text.toLowerCase().includes(locationPattern.toLowerCase())) {
          result.country = pattern.country;

          // Extract city if it's a specific city
          if (locationPattern === "London") {
            result.city = "London";
          } else if (
            ["Lagos", "Abuja", "Port Harcourt"].includes(locationPattern)
          ) {
            result.city = locationPattern;
          }

          break;
        }
      }
      if (result.country) break;
    }

    return result;
  }

  extractSkills(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const foundSkills: string[] = [];

    for (const skill of this.curatedSkills) {
      const skillLower = skill.toLowerCase();
      if (text.includes(skillLower)) {
        foundSkills.push(skill);
      }
    }

    return foundSkills;
  }

  generateContentHash(
    title: string,
    description: string,
    salary?: ParsedSalary
  ): string {
    const content = `${title}${description}${salary?.min_salary}${salary?.max_salary}${salary?.currency}`;
    return createHash("md5").update(content).digest("hex");
  }

  private parseNumber(value: string): number {
    return parseFloat(value.replace(/,/g, ""));
  }
}
