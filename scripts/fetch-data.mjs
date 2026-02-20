#!/usr/bin/env node
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WeChat Cloud credentials
const APP_ID = "wxbf37da42bc39fbab";
const APP_SECRET = "1b88e561531828d085ad6785a1dd987a";
const ENV_ID = "cloud1-4g66eqxi4d125db6";

// Output directory
const OUTPUT_DIR = path.join(__dirname, "../client/public/data");

/**
 * Get WeChat access token
 */
async function getAccessToken() {
  try {
    console.log("🔑 Getting WeChat access token...");
    const response = await axios.get("https://api.weixin.qq.com/cgi-bin/token", {
      params: {
        grant_type: "client_credential",
        appid: APP_ID,
        secret: APP_SECRET,
      },
      timeout: 10000,
    });

    if (response.data.errcode) {
      throw new Error(`WeChat API error: ${response.data.errmsg}`);
    }

    console.log("✅ Access token obtained");
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Failed to get access token:", error.message);
    throw error;
  }
}

/**
 * Query WeChat Cloud database with pagination support
 */
async function queryDatabase(accessToken, collectionName, limit = 100, skip = 0) {
  try {
    const query = `db.collection('${collectionName}').skip(${skip}).limit(${limit}).get()`;
    
    const response = await axios.post(
      `https://api.weixin.qq.com/tcb/databasequery?access_token=${accessToken}`,
      {
        env: ENV_ID,
        query: query,
      },
      {
        timeout: 30000,
      }
    );

    if (response.data.errcode && response.data.errcode !== 0) {
      throw new Error(`${response.data.errmsg} (errcode: ${response.data.errcode})`);
    }

    // WeChat Cloud returns data as JSON strings, need to parse them
    const rawData = response.data.data || [];
    return rawData.map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch (e) {
          console.warn('Failed to parse item:', item);
          return item;
        }
      }
      return item;
    });
  } catch (error) {
    console.error(`❌ Query ${collectionName} failed:`, error.message);
    throw error;
  }
}

/**
 * Fetch all records from a collection with pagination
 */
async function fetchAllRecords(accessToken, collectionName, expectedCount) {
  console.log(`📊 Fetching ${collectionName}...`);
  
  const allRecords = [];
  let skip = 0;
  const limit = 100;
  
  while (true) {
    const records = await queryDatabase(accessToken, collectionName, limit, skip);
    
    if (records.length === 0) {
      break;
    }
    
    allRecords.push(...records);
    console.log(`   Fetched ${allRecords.length} records so far...`);
    
    if (records.length < limit) {
      break; // Last page
    }
    
    skip += limit;
  }
  
  console.log(`✅ Fetched ${allRecords.length} ${collectionName} (expected: ~${expectedCount})`);
  return allRecords;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log("🚀 Starting data fetch from WeChat Cloud...\n");

    // Get access token
    const accessToken = await getAccessToken();
    console.log("");

    // Fetch all collections
    const users = await fetchAllRecords(accessToken, "users", 120);
    const events = await fetchAllRecords(accessToken, "events", 137);
    const goalRecords = await fetchAllRecords(accessToken, "goal_records", 209);
    const evaluations = await fetchAllRecords(accessToken, "evaluations", 178);
    const competitions = await fetchAllRecords(accessToken, "competitions", 6);

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`\n📁 Created directory: ${OUTPUT_DIR}`);
    }

    // Write data files
    console.log("\n💾 Writing data files...");
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, "users.json"),
      JSON.stringify(users, null, 2)
    );
    console.log(`   ✅ users.json (${users.length} records)`);

    fs.writeFileSync(
      path.join(OUTPUT_DIR, "events.json"),
      JSON.stringify(events, null, 2)
    );
    console.log(`   ✅ events.json (${events.length} records)`);

    fs.writeFileSync(
      path.join(OUTPUT_DIR, "goal_records.json"),
      JSON.stringify(goalRecords, null, 2)
    );
    console.log(`   ✅ goal_records.json (${goalRecords.length} records)`);

    fs.writeFileSync(
      path.join(OUTPUT_DIR, "evaluations.json"),
      JSON.stringify(evaluations, null, 2)
    );
    console.log(`   ✅ evaluations.json (${evaluations.length} records)`);

    fs.writeFileSync(
      path.join(OUTPUT_DIR, "competitions.json"),
      JSON.stringify(competitions, null, 2)
    );
    console.log(`   ✅ competitions.json (${competitions.length} records)`);

    // Write metadata
    const metadata = {
      lastUpdated: new Date().toISOString(),
      collections: {
        users: users.length,
        events: events.length,
        goal_records: goalRecords.length,
        evaluations: evaluations.length,
        competitions: competitions.length,
      },
    };
    fs.writeFileSync(
      path.join(OUTPUT_DIR, "metadata.json"),
      JSON.stringify(metadata, null, 2)
    );
    console.log(`   ✅ metadata.json`);

    console.log("\n🎉 Data fetch completed successfully!");
    console.log(`   Total records: ${users.length + events.length + goalRecords.length + evaluations.length + competitions.length}`);
  } catch (error) {
    console.error("\n❌ Data fetch failed:", error.message);
    process.exit(1);
  }
}

main();
