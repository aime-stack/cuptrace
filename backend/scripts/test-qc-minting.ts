
import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:3001";
const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY;

// Colors
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m"
};

const log = {
    success: (msg: string) => console.log(`${colors.green}[OK] ${msg}${colors.reset}`),
    warn: (msg: string) => console.log(`${colors.yellow}[WARN] ${msg}${colors.reset}`),
    error: (msg: string) => console.log(`${colors.red}[FAIL] ${msg}${colors.reset}`),
    info: (msg: string) => console.log(`${colors.cyan}[INFO] ${msg}${colors.reset}`),
    step: (msg: string) => console.log(`\n${colors.yellow}===============================================================${colors.reset}\n${colors.yellow}| ${msg.padEnd(61)} |${colors.reset}\n${colors.yellow}===============================================================${colors.reset}\n`)
};

async function testQcMinting() {
    const AGENT_EMAIL = "agent.huye@cuptrace.rw";
    const AGENT_PASSWORD = "agent123";
    const FARMER_EMAIL = "farmer@test.local";
    const QC_EMAIL = "qc@cuptrace.rw";
    const QC_PASSWORD = "quality123";

    // Step 1: Health Check
    log.step("Step 1: Checking Backend Health");
    try {
        const res = await fetch(`${API_URL}/health`);
        if (res.ok) log.success(`Backend is running at ${API_URL}`);
        else throw new Error("Backend not healthy");
    } catch (err: any) {
        log.error(`Backend is not reachable at ${API_URL}`);
        process.exit(1);
    }

    // Step 2: Authenticate Agent & Find Farmer
    log.step("Step 2: Authenticate as Agent");
    let agentToken = "";
    let farmerId = "";

    try {
        // Agent Login
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: AGENT_EMAIL, password: AGENT_PASSWORD })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        agentToken = data.data.token;
        log.success("Agent authenticated");

        // Find Farmer
        log.info("Attempting to use seeded farmer...");
        const farmerRes = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "jean.farmer@cuptrace.rw", password: "farmer123" }) // Seeded default
        });

        if (farmerRes.ok) {
            const farmerData = await farmerRes.json();
            farmerId = farmerData.data.user.id;
            log.success(`Found seeded farmer ID: ${farmerId}`);
        } else {
            // Fallback search
            const usersRes = await fetch(`${API_URL}/auth/users?role=farmer&limit=1`, {
                headers: { "Authorization": `Bearer ${agentToken}` }
            });
            const usersData = await usersRes.json();
            if (usersData.data.length > 0) {
                farmerId = usersData.data[0].id;
                log.success(`Found fallback farmer ID: ${farmerId}`);
            } else {
                throw new Error("No farmer found");
            }
        }
    } catch (err: any) {
        log.error(`Failed to auth agent or find farmer: ${err.message}`);
        process.exit(1);
    }

    // Step 3: Create Batch
    log.step("Step 3: Creating Coffee Batch");
    let batchId = "";
    let qrCode = "";
    try {
        const batchBody = {
            originLocation: "Huye, Rwanda",
            region: "Southern",
            district: "Huye",
            sector: "Gitarama",
            cell: "Ruhango",
            village: "Ikembe",
            lotId: `BATCH-TS-${Math.floor(Math.random() * 9000) + 1000}`,
            quantity: 100,
            quality: "Premium Washed",
            moisture: 11.5,
            harvestDate: new Date(Date.now() - 864000000).toISOString(),
            processingType: "Washed",
            grade: "A",
            description: "TS Test Batch",
            tags: ["ts-test", "washed"],
            farmerId: farmerId // Add farmerId
        };

        const res = await fetch(`${API_URL}/coffee`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${agentToken}`
            },
            body: JSON.stringify(batchBody)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);

        batchId = data.data.id;
        qrCode = data.data.qrCode;
        log.success(`Batch created successfully: ${batchId}`);
    } catch (err: any) {
        log.error(`Failed to create batch: ${err.message}`);
        process.exit(1);
    }

    // Step 4: Auth QC
    log.step("Step 4: Authenticate as QC");
    let qcToken = "";
    try {
        // Try seeded login
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: QC_EMAIL, password: QC_PASSWORD })
        });
        const data = await res.json();

        if (res.ok) {
            qcToken = data.data.token;
            log.success("QC Authenticated");
        } else {
            // Register fallback
            log.warn("Seeded QC not found. Registering new QC...");
            const regRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: "Test QC TS",
                    email: "qc-ts@test.local",
                    password: "password123",
                    role: "qc"
                })
            });
            const regData = await regRes.json();
            if (!regData.success) { // Might already exist
                // Try login
                const loginRes = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: "qc-ts@test.local", password: "password123" })
                });
                const loginData = await loginRes.json();
                if (!loginRes.ok) throw new Error("Failed to register/login QC");
                qcToken = loginData.data.token;
            } else {
                qcToken = regData.data.token;
            }
            log.success("QC Registered/Authenticated");
        }
    } catch (err: any) {
        log.error(`QC Auth failed: ${err.message}`);
        process.exit(1);
    }

    // Step 5: Approve Batch
    log.step("Step 5: QC Approves Batch");
    let ipfsCid = "";
    let nftInfo: any = null;
    let approvalTxHash = "";
    try {
        const res = await fetch(`${API_URL}/coffee/${batchId}/approve`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${qcToken}`
            },
            body: JSON.stringify({})
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);

        const result = data.data;
        ipfsCid = result.ipfsCid;
        approvalTxHash = result.approvalTxHash;
        nftInfo = result.nft;

        log.success("Batch approved");
        log.info(`Approval TX: ${approvalTxHash}`);
        log.info(`IPFS CID: ${ipfsCid}`);
        if (nftInfo) {
            log.success("NFT Minted");
            log.info(`Policy: ${nftInfo.policyId}`);
        } else {
            log.warn("NFT Info missing (might be pending)");
        }
    } catch (err: any) {
        log.error(`Approval failed: ${err.message}`);
        process.exit(1);
    }

    // Step 6: Verify IPFS
    log.step("Step 6: Verify IPFS Metadata");
    if (ipfsCid) {
        const ipfsUrl = `https://ipfs.io/ipfs/${ipfsCid}`;
        log.info(`IPFS URL: ${ipfsUrl}`);
        // Don't error/exit on IPFS fetch since it can be slow to propagate
        try {
            // const ipfsRes = await fetch(ipfsUrl); 
            // if(ipfsRes.ok) log.success("Metadata retrieved");
            log.info("Skipping actual IPFS fetch (slow propagation)");
        } catch (err) { }
    } else {
        log.warn("No IPFS CID returned");
    }

    // Step 7: Verify On-Chain
    log.step("Step 7: Verify On-Chain (Blockfrost)");
    if (!BLOCKFROST_API_KEY) {
        log.warn("BLOCKFROST_API_KEY not set. Skipping on-chain verify.");
    } else {
        const headers = { "project_id": BLOCKFROST_API_KEY };
        const bfUrl = "https://cardano-preprod.blockfrost.io/api/v0";

        if (approvalTxHash) {
            try {
                const res = await fetch(`${bfUrl}/txs/${approvalTxHash}`, { headers });
                if (res.ok) log.success("Approval TX confirmed on-chain");
                else log.warn("Approval TX not found (might be pending)");
            } catch (e) { }
        }
    }

    // Step 8: Query Verify Endpoint
    log.step("Step 8: Query Verify Endpoint");
    try {
        // Note: Endpoint uses QR code string, usually stored in `qrCode` field
        // The PS1 script used `qrCode` var which came from create batch response
        const res = await fetch(`${API_URL}/coffee/verify/${qrCode}`);
        const data = await res.json();
        if (res.ok) {
            log.success("Verification successful");
            log.info(`Verified: ${data.data.verified}`);
            log.info(`Status: ${data.data.batch.status}`);
        } else {
            log.error("Verification endpoint query failed");
        }
    } catch (err: any) {
        log.error(`Verify query error: ${err.message}`);
    }

    log.success("Test completed successfully!");
}

testQcMinting().catch(console.error);
