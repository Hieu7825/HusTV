// replace-user-findbyid.js
// Chạy: node replace-user-findbyid.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to search
const searchDirs = [
  path.join(__dirname, "server/controllers"),
  path.join(__dirname, "server/middleware"),
  path.join(__dirname, "server/inngest/functions"),
];

// Pattern to find and replace
const patterns = [
  {
    // Pattern 1: User.findById(userId).populate({
    find: /User\.findById\(userId\)\.populate\(\{/g,
    replace: "User.findByClerkId(userId).populate({",
  },
  {
    // Pattern 2: User.findById(userId).populate("
    find: /User\.findById\(userId\)\.populate\("/g,
    replace: 'User.findByClerkId(userId).populate("',
  },
  {
    // Pattern 3: User.findById(userId).select(
    find: /User\.findById\(userId\)\.select\(/g,
    replace: "User.findByClerkId(userId).select(",
  },
  {
    // Pattern 4: User.findById(userId) - standalone (not followed by dot)
    find: /User\.findById\(userId\)(?![\.\w])/g,
    replace: "User.findByClerkId(userId)",
  },
  {
    // Pattern 5: User.findById(subscription.user)
    find: /User\.findById\(subscription\.user\)/g,
    replace: "User.findByClerkId(subscription.user)",
  },
  {
    // Pattern 6: User.findById(userId).populate({
    find: /User\.findById\(userId\)\.populate\(\{/g,
    replace: "User.findByClerkId(userId).populate({",
  },
];

function searchFiles(dir) {
  let files = [];

  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return files;
  }

  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(searchFiles(fullPath));
    } else if (item.endsWith(".js")) {
      files.push(fullPath);
    }
  });

  return files;
}

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;
    let changeCount = 0;

    patterns.forEach((pattern) => {
      const matches = content.match(pattern.find);
      if (matches) {
        changeCount += matches.length;
        content = content.replace(pattern.find, pattern.replace);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(
        `✅ Updated: ${path.relative(
          process.cwd(),
          filePath
        )} (${changeCount} changes)`
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log("🔍 Starting replacement...\n");

let totalFiles = 0;
let updatedFiles = 0;
let totalChanges = 0;

searchDirs.forEach((dir) => {
  const files = searchFiles(dir);

  files.forEach((file) => {
    totalFiles++;
    if (replaceInFile(file)) {
      updatedFiles++;
    }
  });
});

console.log(
  `\n✨ Done! Scanned ${totalFiles} files, updated ${updatedFiles} files`
);
console.log("\n📝 Next steps:");
console.log("1. Review the changes in the updated files");
console.log("2. Test your application");
console.log("3. If any issues, you can revert with git");
