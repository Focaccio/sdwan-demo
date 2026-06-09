#!/usr/bin/env node
// Build the v1 editable PowerPoint deck for the Air-Gap registration process.

import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const REPO = path.resolve(new URL("..", import.meta.url).pathname);
const SKILL_DIR =
  process.env.PRESENTATIONS_SKILL_DIR ||
  "/Users/greg/.codex/plugins/cache/openai-primary-runtime/presentations/26.601.10930/skills/presentations";
const UTILS = path.join(SKILL_DIR, "scripts", "artifact_tool_utils.mjs");
const NODE_PYTHON =
  process.env.PYTHON ||
  "/Users/greg/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const WORKSPACE = path.join(REPO, "outputs", "manual-airgap-v1", "presentations", "air-gap-process");
const PREVIEW_DIR = path.join(WORKSPACE, "preview");
const OUTPUT = path.join(REPO, "docs", "air-gap-registration-and-ecsp-licensing-process-v1.pptx");
const CONTACT_SHEET = path.join(WORKSPACE, "contact-sheet.png");

const {
  createSlideContext,
  ensureArtifactToolWorkspace,
  importArtifactTool,
  saveBlobToFile,
} = await import(UTILS);

const C = {
  ink: "#102033",
  muted: "#53606F",
  blue: "#1F4E79",
  blue2: "#2E75B6",
  cyan: "#DDEFFB",
  green: "#2E7D5B",
  greenFill: "#E7F4EE",
  gold: "#8A6500",
  goldFill: "#FFF3CF",
  red: "#9B1C1C",
  redFill: "#FDE8E8",
  gray: "#F4F7FB",
  line: "#C7D1DD",
  white: "#FFFFFF",
};

const slideSize = { width: 1280, height: 720 };

function addTitle(ctx, slide, title, kicker = "Version 1.0") {
  ctx.addText(slide, {
    x: 64,
    y: 34,
    width: 860,
    height: 32,
    text: kicker.toUpperCase(),
    fontSize: 14,
    bold: true,
    color: C.blue2,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
  ctx.addText(slide, {
    x: 64,
    y: 62,
    width: 1040,
    height: 70,
    text: title,
    fontSize: 34,
    bold: true,
    color: C.ink,
    typeface: "Aptos Display",
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
  ctx.addShape(slide, { x: 64, y: 132, width: 1088, height: 2, fill: C.line });
}

function addFooter(ctx, slide, n) {
  ctx.addText(slide, {
    x: 64,
    y: 684,
    width: 760,
    height: 22,
    text: "HPE Aruba Networking EdgeConnect SD-WAN Air-Gap runbook | Do not store keys or license files in Git",
    fontSize: 10,
    color: C.muted,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
  ctx.addText(slide, {
    x: 1150,
    y: 684,
    width: 54,
    height: 22,
    text: String(n).padStart(2, "0"),
    fontSize: 10,
    color: C.muted,
    align: "right",
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

function card(ctx, slide, { x, y, w, h, title, body, fill = C.white, line = C.line, accent = C.blue }) {
  ctx.addShape(slide, {
    x,
    y,
    width: w,
    height: h,
    fill,
    line: { style: "solid", fill: line, width: 1 },
  });
  ctx.addShape(slide, { x, y, width: 6, height: h, fill: accent });
  ctx.addText(slide, {
    x: x + 20,
    y: y + 14,
    width: w - 34,
    height: 26,
    text: title,
    fontSize: 17,
    bold: true,
    color: C.ink,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
  ctx.addText(slide, {
    x: x + 20,
    y: y + 48,
    width: w - 34,
    height: h - 58,
    text: body,
    fontSize: 13,
    color: C.muted,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

function pill(ctx, slide, x, y, text, fill, color = C.ink, w = 170) {
  ctx.addShape(slide, { x, y, width: w, height: 34, fill, line: { style: "solid", fill, width: 0 } });
  ctx.addText(slide, {
    x,
    y: y + 7,
    width: w,
    height: 20,
    text,
    fontSize: 12,
    bold: true,
    color,
    align: "center",
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

function arrow(ctx, slide, x1, y, x2, label = "") {
  const width = x2 - x1;
  ctx.addShape(slide, { x: x1, y, width, height: 3, fill: C.blue2 });
  ctx.addText(slide, {
    x: x2 - 16,
    y: y - 10,
    width: 24,
    height: 22,
    text: ">",
    fontSize: 18,
    bold: true,
    color: C.blue2,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
  if (label) {
    ctx.addText(slide, {
      x: x1,
      y: y - 30,
      width,
      height: 20,
      text: label,
      fontSize: 11,
      bold: true,
      color: C.blue,
      align: "center",
      insets: { left: 0, right: 0, top: 0, bottom: 0 },
    });
  }
}

function bullets(ctx, slide, x, y, items, opts = {}) {
  const fontSize = opts.fontSize || 15;
  items.forEach((item, i) => {
    const top = y + i * (opts.gap || 48);
    ctx.addShape(slide, { x, y: top + 6, width: 10, height: 10, fill: opts.dot || C.blue2 });
    ctx.addText(slide, {
      x: x + 22,
      y: top,
      width: opts.width || 500,
      height: opts.height || 42,
      text: item,
      fontSize,
      color: opts.color || C.ink,
      insets: { left: 0, right: 0, top: 0, bottom: 0 },
    });
  });
}

async function build() {
  await ensureArtifactToolWorkspace(WORKSPACE);
  const artifact = await importArtifactTool(WORKSPACE);
  const { Presentation, PresentationFile } = artifact;
  const presentation = Presentation.create({ slideSize });
  const ctx = createSlideContext(artifact, { slideSize, workspaceDir: WORKSPACE });

  {
    const slide = presentation.slides.add();
    ctx.addShape(slide, { x: 0, y: 0, width: 1280, height: 720, fill: C.gray });
    ctx.addText(slide, {
      x: 64,
      y: 74,
      width: 910,
      height: 108,
      text: "Air-Gap Orchestrator Registration and EC-S-P Licensing",
      fontSize: 42,
      bold: true,
      color: C.ink,
      typeface: "Aptos Display",
      insets: { left: 0, right: 0, top: 0, bottom: 0 },
    });
    ctx.addText(slide, {
      x: 66,
      y: 188,
      width: 650,
      height: 58,
      text: "Version 1.0 process deck for one self-hosted Orchestrator and three physical EdgeConnect EC-S-P appliances.",
      fontSize: 18,
      color: C.muted,
      insets: { left: 0, right: 0, top: 0, bottom: 0 },
    });
    card(ctx, slide, {
      x: 70,
      y: 332,
      w: 300,
      h: 134,
      title: "1 Orchestrator",
      body: "Self-hosted deployment; Air-Gap mode is a controlled and hard-to-reverse change.",
      fill: C.white,
      accent: C.blue,
    });
    card(ctx, slide, {
      x: 410,
      y: 332,
      w: 300,
      h: 134,
      title: "3 EC-S-P appliances",
      body: "Physical EdgeConnect appliances must be licensed and then enabled for Air-Gap mode individually.",
      fill: C.white,
      accent: C.green,
    });
    card(ctx, slide, {
      x: 750,
      y: 332,
      w: 300,
      h: 134,
      title: "Manual exchange",
      body: "Registration responses, license files, and supporting files move through approved removable-media controls.",
      fill: C.white,
      accent: C.gold,
    });
    addFooter(ctx, slide, 1);
  }

  {
    const slide = presentation.slides.add();
    addTitle(ctx, slide, "Process at a Glance");
    const xs = [78, 300, 522, 744, 966];
    const labels = [
      ["Prepare", "Portal account, versions, serials, transfer controls"],
      ["Register", "Exchange Orchestrator key and portal response"],
      ["License", "Assign EC, Boost, and feature licenses"],
      ["Upload", "Move license and supporting files to Orchestrator"],
      ["Enable", "Turn on Air-Gap mode on each EC-S-P"],
    ];
    labels.forEach(([t, b], i) => {
      card(ctx, slide, { x: xs[i], y: 230, w: 180, h: 156, title: t, body: b, fill: i % 2 ? C.white : C.cyan, accent: C.blue2 });
      if (i < labels.length - 1) arrow(ctx, slide, xs[i] + 184, 306, xs[i + 1] - 10);
    });
    bullets(ctx, slide, 92, 470, [
      "License and supporting files are operational artifacts, not repository artifacts.",
      "Download a new license file after every add, reassign, or revoke action.",
      "After file upload, appliance enablement is repeated on edgeconnect-1, edgeconnect-2, and edgeconnect-3.",
    ], { width: 980, gap: 44, dot: C.green });
    addFooter(ctx, slide, 2);
  }

  {
    const slide = presentation.slides.add();
    addTitle(ctx, slide, "Boundary Model: Connected Portal, Isolated SD-WAN");
    card(ctx, slide, { x: 80, y: 190, w: 280, h: 180, title: "Internet-connected side", body: "Air-Gap Portal\nHPE account\nLicense assignment\nRequired file downloads", fill: C.cyan, accent: C.blue });
    card(ctx, slide, { x: 500, y: 190, w: 220, h: 180, title: "Approved transfer", body: "Removable media\nMalware scan\nChain of custody\nTemporary files outside Git", fill: C.goldFill, accent: C.gold });
    card(ctx, slide, { x: 860, y: 190, w: 280, h: 180, title: "Isolated side", body: "Orchestrator Air-Gap tab\nLicense file upload\nSupporting file upload\nEC-S-P appliance UIs", fill: C.greenFill, accent: C.green });
    arrow(ctx, slide, 370, 270, 492, "registration key");
    arrow(ctx, slide, 730, 270, 852, "portal response / files");
    card(ctx, slide, { x: 158, y: 452, w: 860, h: 88, title: "Repository rule", body: "The repo stores the runbook, scripts, and final docs only. It must not store registration keys, account keys, portal responses, license files, supporting ZIPs, or appliance backups.", fill: C.redFill, accent: C.red });
    addFooter(ctx, slide, 3);
  }

  {
    const slide = presentation.slides.add();
    addTitle(ctx, slide, "Register the Orchestrator");
    card(ctx, slide, { x: 76, y: 180, w: 296, h: 156, title: "Enable Air-Gap", body: "Orchestrator > Orchestrator Server > Licensing > Air-Gap\n\nSelect Enable Air-Gap mode and confirm.", fill: C.white, accent: C.blue });
    card(ctx, slide, { x: 430, y: 180, w: 296, h: 156, title: "Copy key", body: "Click Air-Gap Registration, Show Registration Key, then Copy Registration Key.", fill: C.white, accent: C.blue2 });
    card(ctx, slide, { x: 784, y: 180, w: 296, h: 156, title: "Portal response", body: "Paste the key in the Air-Gap Portal Register Orchestrator tab and copy the response.", fill: C.white, accent: C.green });
    arrow(ctx, slide, 382, 256, 420);
    arrow(ctx, slide, 736, 256, 774);
    card(ctx, slide, { x: 220, y: 430, w: 740, h: 100, title: "Complete registration", body: "Return to Orchestrator > Licensing > Air-Gap, paste the portal response, click Save Portal Response, and close the dialog.", fill: C.greenFill, accent: C.green });
    addFooter(ctx, slide, 4);
  }

  {
    const slide = presentation.slides.add();
    addTitle(ctx, slide, "License the Three EC-S-P Appliances in the Portal");
    bullets(ctx, slide, 82, 178, [
      "Open License & Manage Appliances and confirm all three EC-S-P serial numbers are present.",
      "Select the appliances to license; verify the selection because the portal may default to all appliances.",
      "Use Assign/Revoke Licenses to Add/Replace EC size, Boost, WAN Optimization, or Advanced Security / DTD.",
      "Click Apply and verify the table shows expected licenses for edgeconnect-1, edgeconnect-2, and edgeconnect-3.",
    ], { width: 720, gap: 70, fontSize: 16, dot: C.blue2 });
    card(ctx, slide, { x: 880, y: 196, w: 258, h: 116, title: "Bulk assignment", body: "All appliances must be on the same software version.", fill: C.goldFill, accent: C.gold });
    card(ctx, slide, { x: 880, y: 344, w: 258, h: 116, title: "RMA rule", body: "Revoke an appliance license before RMA activity.", fill: C.redFill, accent: C.red });
    addFooter(ctx, slide, 5);
  }

  {
    const slide = presentation.slides.add();
    addTitle(ctx, slide, "Download and Upload Required Files");
    card(ctx, slide, { x: 90, y: 180, w: 300, h: 150, title: "Download from portal", body: "Select all appliances, click Download Required Files, then download Appliance Licenses and Supporting File.", fill: C.cyan, accent: C.blue });
    card(ctx, slide, { x: 490, y: 180, w: 300, h: 150, title: "Transfer inward", body: "Move both encrypted files into the isolated environment using the approved transfer process.", fill: C.goldFill, accent: C.gold });
    card(ctx, slide, { x: 890, y: 180, w: 300, h: 150, title: "Upload to Orchestrator", body: "Use Air-Gap File Upload to upload the license file and supporting file package.", fill: C.greenFill, accent: C.green });
    arrow(ctx, slide, 400, 254, 480);
    arrow(ctx, slide, 800, 254, 880);
    card(ctx, slide, { x: 180, y: 430, w: 860, h: 86, title: "Operational cadence", body: "Download a new license file after every license change. Update the supporting file package monthly or according to HPE guidance and local policy.", fill: C.white, accent: C.blue2 });
    addFooter(ctx, slide, 6);
  }

  {
    const slide = presentation.slides.add();
    addTitle(ctx, slide, "Enable Air-Gap Mode on Each EC-S-P");
    ["edgeconnect-1", "edgeconnect-2", "edgeconnect-3"].forEach((name, i) => {
      card(ctx, slide, {
        x: 92 + i * 370,
        y: 196,
        w: 296,
        h: 214,
        title: name,
        body: "1. Administration > HPE Aruba Networking Cloud Services\n2. Select Enable Air-Gap Mode\n3. Enter Orchestrator IP\n4. Administration > License & Registration\n5. Enter account name and account key\n6. Apply and sign out",
        fill: i === 1 ? C.greenFill : C.white,
        accent: C.green,
      });
    });
    pill(ctx, slide, 258, 486, "repeat per appliance", C.greenFill, C.green, 250);
    pill(ctx, slide, 536, 486, "account name is case-sensitive", C.goldFill, C.gold, 280);
    pill(ctx, slide, 844, 486, "serial must be in license file", C.redFill, C.red, 300);
    addFooter(ctx, slide, 7);
  }

  {
    const slide = presentation.slides.add();
    addTitle(ctx, slide, "Validation and Completion Criteria");
    card(ctx, slide, { x: 78, y: 176, w: 350, h: 250, title: "Orchestrator validation", body: "Air-Gap mode enabled\nRegistration complete\nLatest license file uploaded\nLatest supporting package uploaded\nNo unexpected Air-Gap alarms", fill: C.cyan, accent: C.blue });
    card(ctx, slide, { x: 500, y: 176, w: 350, h: 250, title: "Appliance validation", body: "All three EC-S-Ps visible\nExpected serial numbers\nValid EC licenses\nOptional licenses present\nSoftware versions match plan", fill: C.greenFill, accent: C.green });
    card(ctx, slide, { x: 922, y: 176, w: 240, h: 250, title: "Repo validation", body: "Run git status --ignored\nConfirm sensitive files are absent\nCommit only docs, scripts, and final deliverables", fill: C.goldFill, accent: C.gold });
    ctx.addText(slide, {
      x: 160,
      y: 520,
      width: 900,
      height: 44,
      text: "Complete when Orchestrator is registered, all three EC-S-P appliances are licensed and visible, and no sensitive Air-Gap artifacts are in Git.",
      fontSize: 20,
      bold: true,
      color: C.ink,
      align: "center",
      insets: { left: 0, right: 0, top: 0, bottom: 0 },
    });
    addFooter(ctx, slide, 8);
  }

  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  const previews = [];
  for (let i = 0; i < presentation.slides.count; i += 1) {
    const slide = presentation.slides.getItem(i);
    const png = await presentation.export({ slide, format: "png", scale: 1 });
    const previewPath = path.join(PREVIEW_DIR, `slide-${String(i + 1).padStart(2, "0")}.png`);
    await saveBlobToFile(png, previewPath);
    previews.push(previewPath);
  }

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(OUTPUT);

  const contactScript = path.join(SKILL_DIR, "scripts", "make_contact_sheet.py");
  const contact = spawnSync(NODE_PYTHON, [contactScript, "--output", CONTACT_SHEET, ...previews], {
    encoding: "utf8",
  });
  if (contact.status !== 0) {
    throw new Error(`Contact sheet failed:\n${contact.stdout}\n${contact.stderr}`);
  }

  const stat = await fs.stat(OUTPUT);
  console.log(JSON.stringify({ output: OUTPUT, bytes: stat.size, previews, contactSheet: CONTACT_SHEET }, null, 2));
}

build().catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
