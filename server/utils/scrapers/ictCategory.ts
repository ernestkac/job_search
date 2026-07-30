import { JobCategory } from "../../../src/types";
/**
 * Categorizes job title and description into ICT Categories
 */
export function classifyIctCategory(
  title: string,
  description: string,
): JobCategory {
  const text = `${title} ${description}`.toLowerCase();

  if (
    text.includes("cyber") ||
    text.includes("security") ||
    text.includes("soc analyst") ||
    text.includes("firewall")
  ) {
    return "Cybersecurity";
  }
  if (
    text.includes("database") ||
    text.includes("dba") ||
    text.includes("sql") ||
    text.includes("oracle")
  ) {
    return "Database Administrator";
  }
  if (
    text.includes("developer") ||
    text.includes("software") ||
    text.includes("programmer") ||
    text.includes("full stack") ||
    text.includes("frontend") ||
    text.includes("backend")
  ) {
    return "Software Developer";
  }
  if (text.includes("web") || text.includes("wordpress")) {
    return "Web Developer";
  }
  if (
    text.includes("network") ||
    text.includes("cisco") ||
    text.includes("routing") ||
    text.includes("switching") ||
    text.includes("wan") ||
    text.includes("lan")
  ) {
    return "Network Administrator";
  }
  if (
    text.includes("systems administrator") ||
    text.includes("sysadmin") ||
    text.includes("windows server") ||
    text.includes("linux admin") ||
    text.includes("vmware")
  ) {
    return "Systems Administrator";
  }
  if (
    text.includes("systems analyst") ||
    text.includes("business analyst") ||
    text.includes("requirements")
  ) {
    return "Systems Analyst";
  }
  if (
    text.includes("project manager") ||
    text.includes("pmp") ||
    text.includes("scrum") ||
    text.includes("agile")
  ) {
    return "Technical Project Management";
  }
  if (
    text.includes("technician") ||
    text.includes("hardware") ||
    text.includes("helpdesk")
  ) {
    return "ICT Technician";
  }
  if (text.includes("support") || text.includes("desktop support")) {
    return "IT Support";
  }
  if (text.includes("ict officer")) {
    return "ICT Officer";
  }
  if (text.includes("it officer")) {
    return "IT Officer";
  }
  if (text.includes("information systems") || text.includes("mis")) {
    return "Information Systems";
  }

  return "Other ICT Role";
}
