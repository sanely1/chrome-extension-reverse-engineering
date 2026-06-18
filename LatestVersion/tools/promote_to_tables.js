const fs = require('fs');
const path = require('path');

const OUT_DIR = process.argv[2] || './out_001_gemini_3.5_flash';

function readCsv(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          quoted = false;
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        quoted = true;
      } else if (ch === ',') {
        values.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    values.push(cur);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    return row;
  });
}

function csvEscape(text) {
  const s = String(text ?? '');
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  const endpointsReview = path.join(OUT_DIR, 'census/promoted_endpoints.csv');
  const messagesReview = path.join(OUT_DIR, 'census/message_candidate_review.csv');
  const storageReview = path.join(OUT_DIR, 'census/storage_candidate_review.csv');

  const endpointsDest = path.join(OUT_DIR, 'endpoints.csv');
  const messagesDest = path.join(OUT_DIR, 'messages.csv');
  const storageDest = path.join(OUT_DIR, 'storage_keys.csv');

  // Promote Endpoints
  // For endpoints.csv: url,method,file,line_start,line_end
  if (fs.existsSync(endpointsReview)) {
    const endRows = readCsv(endpointsReview);
    const promoted = endRows.map(r => ({
      url: r.value,
      method: r.method === 'UNKNOWN' ? 'GET' : r.method,
      file: r.file,
      line_start: r.line_start,
      line_end: r.line_end
    }));
    const headers = ["url","method","file","line_start","line_end"];
    const lines = [headers.join(",")];
    for (const r of promoted) {
      lines.push(headers.map(h => csvEscape(r[h])).join(","));
    }
    fs.writeFileSync(endpointsDest, `${lines.join("\n")}\n`, 'utf8');
    console.log(`Promoted ${promoted.length} endpoints to ${endpointsDest}`);
  }

  // Promote Messages (only confirmed_message_channel & likely_message_channel)
  // For messages.csv: channel_name,direction,payload_keys,file,line_start,line_end
  if (fs.existsSync(messagesReview)) {
    const msgRows = readCsv(messagesReview);
    const promoted = msgRows
      .filter(r => r.decision === 'confirmed_message_channel' || r.decision === 'likely_message_channel')
      .map(r => ({
        channel_name: r.channel_name,
        direction: r.direction,
        payload_keys: r.payload_keys,
        file: r.file,
        line_start: r.line_start,
        line_end: r.line_end
      }));
    const headers = ["channel_name","direction","payload_keys","file","line_start","line_end"];
    const lines = [headers.join(",")];
    for (const r of promoted) {
      lines.push(headers.map(h => csvEscape(r[h])).join(","));
    }
    fs.writeFileSync(messagesDest, `${lines.join("\n")}\n`, 'utf8');
    console.log(`Promoted ${promoted.length} messages to ${messagesDest}`);
  }

  // Promote Storage (only confirmed_storage_key & likely_storage_key)
  // For storage_keys.csv: key,type,purpose,file,line_start,line_end
  if (fs.existsSync(storageReview)) {
    const storeRows = readCsv(storageReview);
    const promoted = storeRows
      .filter(r => r.decision === 'confirmed_storage_key' || r.decision === 'likely_storage_key')
      .map(r => ({
        key: r.key,
        type: r.type,
        purpose: r.purpose,
        file: r.file,
        line_start: r.line_start,
        line_end: r.line_end
      }));
    const headers = ["key","type","purpose","file","line_start","line_end"];
    const lines = [headers.join(",")];
    for (const r of promoted) {
      lines.push(headers.map(h => csvEscape(r[h])).join(","));
    }
    fs.writeFileSync(storageDest, `${lines.join("\n")}\n`, 'utf8');
    console.log(`Promoted ${promoted.length} storage keys to ${storageDest}`);
  }
}

main().catch(console.error);
