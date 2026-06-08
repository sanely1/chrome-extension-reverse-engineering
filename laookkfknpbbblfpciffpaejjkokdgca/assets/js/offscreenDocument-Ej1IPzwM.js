import "./main-DggM1g6v.js";
import "./localStorage-B4mFdj8F.js";
import {
  m as e
} from "./migrateLegacyUserMessageHandler-BMN9RYlR.js";
import "./Logger-BTKFyPnc.js";
chrome.runtime && chrome.runtime.onMessage.addListener(((r, t, a) => {
  if ("legacyUserMigration:triggerOffscreenDocumentRequest" === r.type) return e(r.payload, a), !0
}));