import axios from "axios";
import crypto from "crypto";

// WeChat Cloud Development credentials
const APP_ID = "wxbf37da42bc39fbab";
const APP_SECRET = "1b88e561531828d085ad6785a1dd987a";
const ENV_ID = "cloud1-4g66eqxi4d125db6";

// Cache for access token
let accessToken: string | null = null;
let accessTokenExpireTime = 0;

/**
 * Get WeChat Cloud Development access token
 * Token is valid for 2 hours, we cache it with 1 hour TTL for safety
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  
  // Return cached token if still valid
  if (accessToken && now < accessTokenExpireTime) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      "https://api.weixin.qq.com/cgi-bin/token",
      {},
      {
        params: {
          grant_type: "client_credential",
          appid: APP_ID,
          secret: APP_SECRET,
        },
        timeout: 10000,
      }
    );

    if (response.data.errcode) {
      throw new Error(`WeChat API error: ${response.data.errmsg}`);
    }

    accessToken = response.data.access_token;
    // Set expiry to 1 hour from now (token is valid for 2 hours)
    accessTokenExpireTime = now + 60 * 60 * 1000;

    console.log("[WeChat Cloud] Access token obtained successfully");
    return accessToken as string;
  } catch (error) {
    console.error("[WeChat Cloud] Failed to get access token:", error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Call WeChat Cloud Development database API
 */
async function callCloudAPI(
  action: string,
  data: Record<string, any>
): Promise<any> {
  try {
    const token = await getAccessToken();

    const response = await axios.post(
      `https://api.weixin.qq.com/tcb/databasequery?access_token=${token}`,
      {
        env: ENV_ID,
        query: data.query || "",
        ...data,
      },
      {
        timeout: 20000,
      }
    );

    if (response.data.errcode) {
      throw new Error(`WeChat Cloud API error: ${response.data.errmsg}`);
    }

    return response.data;
  } catch (error) {
    console.error(`[WeChat Cloud] ${action} failed:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Fetch all players from WeChat Cloud database
 */
export async function fetchPlayersFromCloud(): Promise<any[]> {
  try {
    const response = await callCloudAPI("fetchPlayers", {
      query: JSON.stringify({
        collection: "players",
        limit: 1000,
      }),
    });

    // Parse response data
    const data = response.data || [];
    console.log("[WeChat Cloud] Fetched players:", data.length);
    return data;
  } catch (error) {
    console.error("[WeChat Cloud] Failed to fetch players:", error);
    return [];
  }
}

/**
 * Fetch all matches from WeChat Cloud database
 */
export async function fetchMatchesFromCloud(): Promise<any[]> {
  try {
    const response = await callCloudAPI("fetchMatches", {
      query: JSON.stringify({
        collection: "matches",
        limit: 1000,
      }),
    });

    // Parse response data
    const data = response.data || [];
    console.log("[WeChat Cloud] Fetched matches:", data.length);
    return data;
  } catch (error) {
    console.error("[WeChat Cloud] Failed to fetch matches:", error);
    return [];
  }
}

/**
 * Fetch player by ID from WeChat Cloud database
 */
export async function fetchPlayerByIdFromCloud(id: string): Promise<any | null> {
  try {
    const response = await callCloudAPI("fetchPlayerById", {
      query: JSON.stringify({
        collection: "players",
        where: {
          _id: id,
        },
        limit: 1,
      }),
    });

    const data = response.data || [];
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("[WeChat Cloud] Failed to fetch player by ID:", error);
    return null;
  }
}

/**
 * Fetch match by ID from WeChat Cloud database
 */
export async function fetchMatchByIdFromCloud(id: string): Promise<any | null> {
  try {
    const response = await callCloudAPI("fetchMatchById", {
      query: JSON.stringify({
        collection: "matches",
        where: {
          _id: id,
        },
        limit: 1,
      }),
    });

    const data = response.data || [];
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("[WeChat Cloud] Failed to fetch match by ID:", error);
    return null;
  }
}

/**
 * Fetch all signups from WeChat Cloud database (signups collection)
 * Maps _openid -> openid for frontend compatibility
 * Uses pagination to fetch all records (API limit: 100 per request)
 */
export async function fetchSignupsFromCloud(): Promise<any[]> {
  try {
    const token = await getAccessToken();
    const allRecords: any[] = [];
    let offset = 0;
    const pageSize = 100;

    while (true) {
      const response = await axios.post(
        `https://api.weixin.qq.com/tcb/databasequery?access_token=${token}`,
        {
          env: ENV_ID,
          query: `db.collection("signups").skip(${offset}).limit(${pageSize}).get()`,
        },
        { timeout: 20000 }
      );

      if (response.data.errcode) {
        throw new Error(`WeChat Cloud API error: ${response.data.errmsg}`);
      }

      const rawData: any[] = response.data.data || [];
      if (rawData.length === 0) break;

      // Parse JSON strings and map _openid -> openid
      for (const item of rawData) {
        let record: any;
        if (typeof item === "string") {
          try { record = JSON.parse(item); } catch { record = item; }
        } else {
          record = item;
        }
        if (record && typeof record === "object") {
          // Map _openid to openid for frontend compatibility
          if (record._openid && !record.openid) {
            record.openid = record._openid;
          }
          allRecords.push(record);
        }
      }

      if (rawData.length < pageSize) break;
      offset += pageSize;
    }

    console.log(`[WeChat Cloud] Fetched signups: ${allRecords.length}`);
    return allRecords;
  } catch (error) {
    console.error("[WeChat Cloud] Failed to fetch signups:", error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Fetch all appreciations from WeChat Cloud database (event_appreciations collection)
 * Returns records with event_id and receiver_openid for MVP calculation
 * Uses pagination to fetch all records (API limit: 100 per request)
 */
export async function fetchAppreciationsFromCloud(): Promise<any[]> {
  try {
    const token = await getAccessToken();
    const allRecords: any[] = [];
    let offset = 0;
    const pageSize = 100;

    while (true) {
      const response = await axios.post(
        `https://api.weixin.qq.com/tcb/databasequery?access_token=${token}`,
        {
          env: ENV_ID,
          query: `db.collection("event_appreciations").skip(${offset}).limit(${pageSize}).get()`,
        },
        { timeout: 20000 }
      );

      if (response.data.errcode) {
        throw new Error(`WeChat Cloud API error: ${response.data.errmsg}`);
      }

      const rawData: any[] = response.data.data || [];
      if (rawData.length === 0) break;

      for (const item of rawData) {
        let record: any;
        if (typeof item === "string") {
          try { record = JSON.parse(item); } catch { record = item; }
        } else {
          record = item;
        }
        if (record && typeof record === "object") {
          allRecords.push(record);
        }
      }

      if (rawData.length < pageSize) break;
      offset += pageSize;
    }

    console.log(`[WeChat Cloud] Fetched event_appreciations: ${allRecords.length}`);
    return allRecords;
  } catch (error) {
    console.error("[WeChat Cloud] Failed to fetch appreciations:", error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Fetch all goal records from WeChat Cloud database (goal_records collection)
 * Returns records with event_id and goals array (scorer_name, assister_name, etc.)
 * Uses pagination to fetch all records (API limit: 100 per request)
 */
export async function fetchGoalRecordsFromCloud(): Promise<any[]> {
  try {
    const token = await getAccessToken();
    const allRecords: any[] = [];
    let offset = 0;
    const pageSize = 100;

    while (true) {
      const response = await axios.post(
        `https://api.weixin.qq.com/tcb/databasequery?access_token=${token}`,
        {
          env: ENV_ID,
          query: `db.collection("goal_records").skip(${offset}).limit(${pageSize}).get()`,
        },
        { timeout: 20000 }
      );

      if (response.data.errcode) {
        throw new Error(`WeChat Cloud API error: ${response.data.errmsg}`);
      }

      const rawData: any[] = response.data.data || [];
      if (rawData.length === 0) break;

      for (const item of rawData) {
        let record: any;
        if (typeof item === "string") {
          try { record = JSON.parse(item); } catch { record = item; }
        } else {
          record = item;
        }
        if (record && typeof record === "object") {
          allRecords.push(record);
        }
      }

      if (rawData.length < pageSize) break;
      offset += pageSize;
    }

    console.log(`[WeChat Cloud] Fetched goal_records: ${allRecords.length}`);
    return allRecords;
  } catch (error) {
    console.error("[WeChat Cloud] Failed to fetch goal records:", error instanceof Error ? error.message : error);
    return [];
  }
}
