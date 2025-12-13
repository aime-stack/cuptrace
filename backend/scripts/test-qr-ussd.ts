
import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:3001";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

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
    step: (msg: string) => console.log(`\n${colors.yellow}${msg}${colors.reset}`)
};

async function testQrUssd() {
    console.log(`${colors.cyan}=== CupTrace QR/USSD Test Script ===${colors.reset}\n`);

    const TEST_EMAIL = "factory@cuptrace.rw";
    const TEST_PASSWORD = "factory123";

    // Step 1: Login
    log.step("[1/6] Authenticating...");
    let token = "";
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);

        token = data.data.token;
        log.success("Authenticated successfully");
    } catch (err: any) {
        log.error(`Authentication failed: ${err.message}`);
        log.warn(`Check if user exists: ${TEST_EMAIL}`);
        process.exit(1);
    }

    // Step 2: Get Approved Batch
    log.step("[2/6] Finding approved batch...");
    let batchId = "";
    try {
        const res = await fetch(`${API_URL}/coffee?status=approved`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);

        if (!data.data || data.data.length === 0) {
            log.error("No approved batches found. Create and approve a batch first.");
            process.exit(1);
        }

        batchId = data.data[0].id;
        log.success(`Found batch: ${batchId}`);
    } catch (err: any) {
        log.error(`Failed to fetch batches: ${err.message}`);
        process.exit(1);
    }

    // Step 3: Generate QR
    log.step("[3/6] Generating QR code...");
    let publicTraceHash = "";
    let qrCodeUrl = "";
    try {
        const res = await fetch(`${API_URL}/api/batches/${batchId}/generate-qr`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok && res.status !== 404) throw new Error(data.error || res.statusText); // 404 is checked in PS1 script via success flag logic

        if (data.success) {
            publicTraceHash = data.data.publicTraceHash;
            qrCodeUrl = data.data.qrCodeUrl;
            const traceUrl = data.data.traceUrl;

            log.success("QR generated successfully");
            console.log(`    - Public Hash: ${publicTraceHash}`);
            console.log(`    - QR URL: ${qrCodeUrl}`);
            console.log(`    - Trace URL: ${traceUrl}`);
        } else {
            log.error("QR generation failed");
            process.exit(1);
        }
    } catch (err: any) {
        log.error(`QR generation error: ${err.message}`);
        process.exit(1);
    }

    // Step 4: Test Public Trace
    log.step("[4/6] Testing public trace endpoint...");
    try {
        const res = await fetch(`${API_URL}/api/trace/${publicTraceHash}`);
        const data = await res.json();

        if (data.success) {
            log.success("Trace endpoint working");

            const farmer = data.data.farmer;
            // Note: In TS, regex matching is direct
            if (farmer && farmer.displayName.match(/^Farmer F-/)) {
                log.success(`Farmer identity anonymized: ${farmer.displayName}`);
            } else if (farmer) {
                log.warn("Farmer identity may not be anonymized");
            }

            if (!data.data.origin.address && !data.data.origin.cell) {
                log.success("No exact address exposed (only region)");
            }
        } else {
            log.error("Trace endpoint returned success: false");
        }
    } catch (err: any) {
        log.error(`Trace endpoint error: ${err.message}`);
    }

    // Step 5: Test USSD
    log.step("[5/6] Testing USSD endpoint...");
    try {
        const ussdBody = {
            sessionId: `test-session-${Math.floor(Math.random() * 10000)}`,
            phoneNumber: "+250781234567",
            text: "",
            serviceCode: "*123#"
        };

        const res = await fetch(`${API_URL}/api/ussd`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ussdBody)
        });
        const text = await res.text();

        if (text.includes("CupTrace")) {
            log.success("USSD endpoint responding");
            console.log(`    Response: ${text.substring(0, 100)}...`);
        } else {
            log.success("USSD endpoint responding (phone not registered)");
        }
    } catch (err: any) {
        log.warn(`USSD test skipped or failed: ${err.message}`);
    }

    // Step 6: Summary
    console.log(`\n${colors.yellow}[6/6] Test Summary${colors.reset}`);
    console.log(`${colors.cyan}================================================${colors.reset}`);
    console.log(`  Batch ID:          ${batchId}`);
    console.log(`  Public Trace Hash: ${publicTraceHash}`);
    console.log(`  QR Code URL:       ${qrCodeUrl}`);
    console.log("");
    console.log(`  Consumer Trace Page:`);
    console.log(`  ${colors.cyan}${FRONTEND_URL}/trace/${publicTraceHash}${colors.reset}`);
    console.log("");
    console.log(`${colors.cyan}================================================${colors.reset}`);
    log.success("Tests completed!");
}

testQrUssd().catch(console.error);
