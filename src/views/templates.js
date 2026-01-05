// HTML Templates for the dashboard

const baseLayout = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/htmx.org@1.9.10"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #09090b;
      --card-bg: #18181b;
      --border-color: #27272a;
    }
    body { 
      font-family: 'JetBrains Mono', monospace; 
      background-color: var(--bg-color);
      background-image: radial-gradient(#27272a 1px, transparent 1px);
      background-size: 24px 24px;
    }
    .glass-panel {
      background: rgba(24, 24, 27, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .progress-bar { 
      transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1); 
    }
    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #52525b; }
  </style>
</head>
<body class="text-zinc-400 min-h-screen flex flex-col selection:bg-teal-900 selection:text-teal-100">
  <nav class="border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-3 group">
        <div class="w-3 h-3 bg-teal-500 rounded-sm group-hover:rotate-45 transition-transform duration-300"></div>
        <span class="text-sm font-bold text-zinc-100 tracking-tight">QUOTA_MONITOR_v1.0</span>
      </a>
      <div class="flex gap-8 text-[11px] font-bold tracking-widest uppercase">
        <a href="/" class="hover:text-teal-400 transition-colors flex items-center gap-2">
          <span class="opacity-50">01.</span> Dashboard
        </a>
        <a href="/settings" class="hover:text-teal-400 transition-colors flex items-center gap-2">
          <span class="opacity-50">02.</span> Settings
        </a>
      </div>
    </div>
  </nav>

  <main class="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
    ${content}
  </main>

  <footer class="border-t border-zinc-900 py-8 text-center text-[10px] text-zinc-600 uppercase tracking-widest">
    System Status: Operational • ${new Date().getFullYear()}
  </footer>
</body>
</html>
`;

const getProgressColor = (percentage) => {
  if (percentage >= 80) return "bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]";
  if (percentage >= 30) return "bg-amber-500";
  return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
};

export function renderDashboard(antigravityTokens, glmSettings, openaiTokens) {
  const content = `
    <header class="mb-12 flex items-end justify-between">
      <div>
        <h1 class="text-3xl font-bold text-zinc-100 tracking-tighter mb-2">SYSTEM_OVERVIEW</h1>
        <p class="text-xs text-zinc-500 uppercase tracking-widest">Real-time resource allocation monitoring</p>
      </div>
      <div class="flex gap-2">
        <div class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
        <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Live Updates</span>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <!-- Antigravity Section -->
      <section class="glass-panel rounded-lg p-1 transition-all duration-300 hover:border-zinc-700 group">
        <div class="bg-zinc-900/50 rounded p-6 h-full relative overflow-hidden">
          <!-- Header -->
          <div class="flex items-start justify-between mb-8 relative z-10">
            <div>
              <div class="flex items-center gap-2 mb-2">
                 <span class="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase tracking-wider">Source_01</span>
              </div>
              <h2 class="text-xl font-bold text-zinc-100">Google Antigravity</h2>
            </div>
            <div class="text-right">
              ${antigravityTokens ? 
                `<div class="flex items-center gap-2 justify-end text-teal-400 mb-1">
                   <div class="w-1.5 h-1.5 bg-current rounded-full"></div>
                   <span class="text-[10px] font-bold uppercase tracking-wider">Connected</span>
                 </div>
                 <div class="text-[10px] text-zinc-500 font-mono border-t border-zinc-800 pt-1 mt-1">${antigravityTokens.email}</div>` : 
                `<a href="/auth/google" class="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-900 px-4 py-2 rounded hover:bg-teal-400 hover:text-zinc-900 transition-colors">
                   <span>Link Account</span>
                   <span>→</span>
                 </a>`
              }
            </div>
          </div>
          
          <!-- Content -->
          <div 
            id="antigravity-quota"
            hx-get="/partials/antigravity-quota"
            hx-trigger="load, every 60s"
            hx-swap="innerHTML"
            class="relative z-10 min-h-[200px]"
          >
            ${antigravityTokens ? 
              '<div class="flex items-center justify-center h-40 text-xs text-zinc-600 animate-pulse font-mono">INITIALIZING_DATA_STREAM...</div>' : 
              '<div class="flex flex-col items-center justify-center h-40 border border-dashed border-zinc-800 rounded bg-zinc-900/30"><span class="text-zinc-600 text-xs mb-2">NO SIGNAL</span><span class="text-[10px] text-zinc-700 uppercase tracking-widest">Authentication Required</span></div>'
            }
          </div>

          ${antigravityTokens ? `
          <div class="mt-8 pt-6 border-t border-zinc-800/50 relative z-10 flex justify-between items-center">
             <span class="text-[10px] text-zinc-600">ID: ${antigravityTokens.projectId || 'UNKNOWN'}</span>
             <form action="/auth/google/logout" method="POST">
               <button type="submit" class="text-[10px] text-zinc-500 hover:text-rose-400 font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                 <span>Term</span>
                 <span class="text-[8px] border border-current px-1 rounded">ESC</span>
               </button>
             </form>
          </div>
          ` : ""}
          
          <!-- Decorative BG -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500"></div>
        </div>
      </section>

      <!-- OpenAI Section -->
      <section class="glass-panel rounded-lg p-1 transition-all duration-300 hover:border-zinc-700 group">
        <div class="bg-zinc-900/50 rounded p-6 h-full relative overflow-hidden">
          <!-- Header -->
          <div class="flex items-start justify-between mb-8 relative z-10">
            <div>
              <div class="flex items-center gap-2 mb-2">
                 <span class="text-[10px] font-bold bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-500/20">Source_02</span>
              </div>
              <h2 class="text-xl font-bold text-zinc-100">ChatGPT Plus</h2>
            </div>
            <div class="text-right">
              ${openaiTokens ? 
                `<div class="flex items-center gap-2 justify-end text-emerald-400 mb-1">
                   <div class="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></div>
                   <span class="text-[10px] font-bold uppercase tracking-wider">Session Active</span>
                 </div>
                 <div class="text-[10px] text-zinc-500 font-mono border-t border-zinc-800 pt-1 mt-1">OPENAI_WHAM_v1</div>` : 
                `<a href="/settings" class="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-900 px-4 py-2 rounded hover:bg-emerald-400 hover:text-zinc-900 transition-colors">
                   <span>Secure Login</span>
                   <span>→</span>
                 </a>`
              }
            </div>
          </div>

          <!-- Content -->
          <div 
            id="openai-quota"
            hx-get="/partials/openai-quota"
            hx-trigger="load, every 60s"
            hx-swap="innerHTML"
            class="relative z-10 min-h-[200px]"
          >
            ${openaiTokens ? 
              '<div class="flex items-center justify-center h-40 text-xs text-zinc-600 animate-pulse font-mono">ESTABLISHING_ENCRYPTED_LINK...</div>' : 
              '<div class="flex flex-col items-center justify-center h-40 border border-dashed border-zinc-800 rounded bg-zinc-900/30"><span class="text-zinc-600 text-xs mb-2">LINK_OFFLINE</span><span class="text-[10px] text-zinc-700 uppercase tracking-widest">Session Token Required</span></div>'
            }
          </div>
          
          <!-- Decorative BG -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
        </div>
      </section>

      <!-- GLM Section -->
      <section class="glass-panel rounded-lg p-1 transition-all duration-300 hover:border-zinc-700 group lg:col-span-2">
        <div class="bg-zinc-900/50 rounded p-6 h-full relative overflow-hidden">
          <!-- Header -->
          <div class="flex items-start justify-between mb-8 relative z-10">
            <div>
              <div class="flex items-center gap-2 mb-2">
                 <span class="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase tracking-wider">Source_03</span>
              </div>
              <h2 class="text-xl font-bold text-zinc-100">GLM Coding Plan</h2>
            </div>
            <div class="text-right">
              ${glmSettings ? 
                `<div class="flex items-center gap-2 justify-end text-teal-400 mb-1">
                   <div class="w-1.5 h-1.5 bg-current rounded-full"></div>
                   <span class="text-[10px] font-bold uppercase tracking-wider">Active</span>
                 </div>
                 <div class="text-[10px] text-zinc-500 font-mono border-t border-zinc-800 pt-1 mt-1">${glmSettings.baseUrl.includes('z.ai') ? 'Z.AI NETWORK' : 'ZHIPU NETWORK'}</div>` : 
                `<a href="/settings" class="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-900 px-4 py-2 rounded hover:bg-teal-400 hover:text-zinc-900 transition-colors">
                   <span>Configure</span>
                   <span>→</span>
                 </a>`
              }
            </div>
          </div>

          <!-- Content -->
          <div 
            id="glm-quota"
            hx-get="/partials/glm-quota"
            hx-trigger="load, every 60s"
            hx-swap="innerHTML"
            class="relative z-10 min-h-[200px]"
          >
            ${glmSettings ? 
              '<div class="flex items-center justify-center h-40 text-xs text-zinc-600 animate-pulse font-mono">INITIALIZING_DATA_STREAM...</div>' : 
              '<div class="flex flex-col items-center justify-center h-40 border border-dashed border-zinc-800 rounded bg-zinc-900/30"><span class="text-zinc-600 text-xs mb-2">NO CONFIG</span><span class="text-[10px] text-zinc-700 uppercase tracking-widest">API Key Required</span></div>'
            }
          </div>
          
          <!-- Decorative BG -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/10 transition-colors duration-500"></div>
        </div>
      </section>
    </div>
  `;

  return baseLayout("Dashboard", content);
}

export function renderSettings(glmSettings, openaiTokens) {
  const content = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- GLM Config -->
      <div class="glass-panel p-1 rounded-lg">
        <div class="bg-zinc-900/80 rounded p-8 h-full">
          <header class="mb-8 border-b border-zinc-800 pb-6">
            <h1 class="text-xl font-bold text-zinc-100 tracking-tight mb-2">GLM_CONSOLE</h1>
            <p class="text-[11px] text-zinc-500 uppercase tracking-wider">Z.AI / ZHIPU API Configuration</p>
          </header>
          
          <form action="/settings/glm" method="POST" class="space-y-8">
            <div class="space-y-2">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Authentication Token</label>
              <div class="relative group">
                <input 
                  type="password" 
                  name="apiKey" 
                  value="${glmSettings?.apiKey || ""}"
                  placeholder="sk-..."
                  class="w-full bg-black/40 border border-zinc-800 rounded px-4 py-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder:text-zinc-700"
                />
                <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <div class="w-1.5 h-1.5 bg-zinc-700 rounded-full group-focus-within:bg-teal-500 transition-colors"></div>
                </div>
              </div>
            </div>
            
            <div class="space-y-2">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Gateway Endpoint</label>
              <div class="relative">
                <select 
                  name="baseUrl"
                  class="w-full bg-black/40 border border-zinc-800 rounded px-4 py-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 appearance-none transition-all cursor-pointer hover:border-zinc-700"
                >
                  <option value="https://api.z.ai/api/anthropic" ${glmSettings?.baseUrl?.includes("z.ai") ? "selected" : ""}>Z.AI (api.z.ai)</option>
                  <option value="https://open.bigmodel.cn/api/anthropic" ${glmSettings?.baseUrl?.includes("bigmodel") ? "selected" : ""}>ZHIPU (open.bigmodel.cn)</option>
                </select>
                <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500 text-[10px]">▼</div>
              </div>
            </div>

            <div class="pt-6 flex items-center justify-between">
              <button type="submit" class="bg-zinc-100 text-zinc-900 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-teal-400 hover:text-zinc-900 transition-colors shadow-lg shadow-zinc-100/10 hover:shadow-teal-400/20 rounded-sm">
                Save GLM
              </button>
              ${glmSettings ? `
              <button 
                type="button"
                hx-post="/settings/glm/clear"
                hx-confirm="WARN: Verify reset action. Continue?"
                class="text-[10px] font-bold text-zinc-600 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                Reset
              </button>
              ` : ""}
            </div>
          </form>
        </div>
      </div>

      <!-- OpenAI Config -->
      <div class="glass-panel p-1 rounded-lg">
        <div class="bg-zinc-900/80 rounded p-8 h-full">
          <header class="mb-8 border-b border-zinc-800 pb-6">
            <h1 class="text-xl font-bold text-zinc-100 tracking-tight mb-2">OPENAI_WHAM</h1>
            <p class="text-[11px] text-zinc-500 uppercase tracking-wider">ChatGPT Plus Session Connection</p>
          </header>
          
          <form action="/settings/openai" method="POST" class="space-y-8">
            <div class="space-y-2">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Session Access Token</label>
              <div class="relative group">
                <textarea 
                  name="accessToken" 
                  rows="4"
                  placeholder="eyJhbGciOiJSUzI1NiI..."
                  class="w-full bg-black/40 border border-zinc-800 rounded px-4 py-3 text-[10px] font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-700 resize-none"
                >${openaiTokens?.accessToken || ""}</textarea>
              </div>
              
              <div class="flex flex-col gap-4 mt-6">
                <div class="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded">
                  <h4 class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Simplified Connection Method:</h4>
                  <ol class="text-[9px] text-zinc-500 space-y-2 list-decimal ml-4">
                    <li>Open <a href="https://chatgpt.com" target="_blank" class="text-emerald-500 underline">chatgpt.com</a> and ensure you are logged in.</li>
                    <li>Visit <a href="https://chatgpt.com/api/auth/session" target="_blank" class="text-emerald-500 underline">chatgpt.com/api/auth/session</a>.</li>
                    <li>Copy the long string inside the <code class="text-zinc-300">"accessToken"</code> field.</li>
                    <li>Paste it above and save.</li>
                  </ol>
                </div>
                
                <div class="text-[9px] text-zinc-600 flex items-center gap-2 px-2">
                  <div class="w-1 h-1 bg-zinc-600 rounded-full"></div>
                  <span>Alternative: Check Network tab for 'wham/usage' -> Authorization header</span>
                </div>
              </div>
            </div>

            <div class="pt-6 flex items-center justify-between">
              <button type="submit" class="bg-zinc-100 text-zinc-900 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 hover:text-zinc-900 transition-colors shadow-lg shadow-zinc-100/10 hover:shadow-emerald-400/20 rounded-sm">
                Connect Session
              </button>
              ${openaiTokens ? `
              <button 
                type="button"
                hx-post="/settings/openai/clear"
                hx-confirm="WARN: Disconnect OpenAI session?"
                class="text-[10px] font-bold text-zinc-600 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                Disconnect
              </button>
              ` : ""}
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  return baseLayout("Settings", content);
}

export function renderQuotaCard(type, quota) {
  if (quota.error) {
    return `
      <div class="bg-rose-500/5 border border-rose-500/20 p-4 rounded flex items-center gap-3">
        <div class="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
        <span class="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Error: ${quota.error}</span>
      </div>
    `;
  }

  if (type === "antigravity") {
    return renderAntigravityQuota(quota);
  } else if (type === "openai") {
    return renderOpenaiQuota(quota);
  } else {
    return renderGlmQuota(quota);
  }
}

function renderOpenaiQuota(quota) {
  if (quota.expired) {
    return `
      <div class="bg-rose-500/10 border border-rose-500/30 p-4 rounded text-center">
        <div class="text-rose-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-3 animate-pulse">!! SESSION_EXPIRED !!</div>
        <a href="/settings" class="inline-block bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/50 text-rose-200 px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all rounded">
          RE-AUTHENTICATE
        </a>
      </div>
    `;
  }

  if (quota.unlimited) {
    return `
      <div class="flex flex-col items-center justify-center h-40 border border-emerald-500/20 rounded bg-emerald-500/5">
        <div class="text-emerald-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">Unlimited Access</div>
        <div class="text-[10px] text-emerald-600 uppercase tracking-widest font-mono">No usage windows detected</div>
      </div>
    `;
  }

  if (!quota.models || quota.models.length === 0) {
    return `<div class="text-xs text-zinc-600 font-mono py-8 text-center uppercase tracking-widest">Awaiting_Data_Packet...</div>`;
  }

  return `
    <div class="space-y-8">
      ${quota.models.map(model => {
        const isCritical = model.remainingPercentage < 20;
        const barColor = isCritical ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
        
        return `
          <div class="group">
            <div class="flex justify-between items-end mb-2">
              <span class="text-xs font-bold text-zinc-300 tracking-tight">${model.displayName}</span>
              <div class="text-right">
                <span class="text-sm font-bold font-mono ${isCritical ? 'text-rose-500' : 'text-zinc-100'}">${model.remainingPercentage}%</span>
              </div>
            </div>
            <div class="w-full bg-black h-1.5 rounded-full overflow-hidden border border-zinc-800/50">
              <div class="progress-bar ${barColor} h-full" style="width: ${model.remainingPercentage}%"></div>
            </div>
            <div class="flex justify-between mt-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
              <span class="text-[9px] text-zinc-600 font-mono uppercase">CAP: ${model.cap} MSG</span>
              <span class="text-[9px] text-zinc-600 font-mono uppercase tracking-tight">${model.timeUntilReset ? `RESET: ${model.timeUntilReset}` : 'SYNCED'}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderAntigravityQuota(quota) {
  if (!quota.models || quota.models.length === 0) {
    return `<div class="text-xs text-zinc-600 font-mono py-8 text-center">NO_DATA_AVAILABLE</div>`;
  }

  return `
    <div class="space-y-8">
      ${quota.models.map(model => `
        <div class="group">
          <div class="flex justify-between items-end mb-2">
            <span class="text-xs font-bold text-zinc-300 tracking-tight">${model.displayName}</span>
            <div class="text-right">
              <span class="text-sm font-bold font-mono ${model.remainingPercentage < 30 ? 'text-rose-500' : 'text-zinc-100'}">${model.remainingPercentage}%</span>
            </div>
          </div>
          <div class="w-full bg-black h-1.5 rounded-full overflow-hidden border border-zinc-800/50">
            <div class="progress-bar ${getProgressColor(model.remainingPercentage)} h-full" style="width: ${model.remainingPercentage}%"></div>
          </div>
          <div class="flex justify-between mt-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
            <span class="text-[9px] text-zinc-600 font-mono uppercase">ALLOCATION</span>
            <span class="text-[9px] text-zinc-600 font-mono uppercase tracking-tight">${model.timeUntilReset ? `RST: ${model.timeUntilReset}` : '---'}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderGlmQuota(quota) {
  let html = '<div class="space-y-8">';

  if (quota.quotaLimit?.limits) {
    for (const limit of quota.quotaLimit.limits) {
      const isHigh = limit.percentage >= 80;
      html += `
        <div>
          <div class="flex justify-between items-end mb-2">
            <span class="text-xs font-bold text-zinc-300 tracking-tight">${limit.type}</span>
            <div class="text-right">
              <span class="text-sm font-bold font-mono ${isHigh ? 'text-rose-500' : 'text-zinc-100'}">${limit.percentage?.toFixed(1) || 0}%</span>
            </div>
          </div>
          <div class="w-full bg-black h-1.5 rounded-full overflow-hidden border border-zinc-800/50">
            <div class="progress-bar ${isHigh ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-zinc-600'} h-full" style="width: ${Math.min(limit.percentage || 0, 100)}%"></div>
          </div>
          <div class="flex justify-between mt-1.5 opacity-50 hover:opacity-100 transition-opacity">
            <span class="text-[9px] text-zinc-600 font-mono uppercase">CONSUMPTION</span>
            ${limit.currentUsage !== undefined ? `
              <span class="text-[9px] text-zinc-600 font-mono tracking-tight">${limit.currentUsage} / ${limit.total}</span>
            ` : ""}
          </div>
        </div>
      `;
    }
  }

  html += '</div>';

  if (quota.modelUsage) {
    html += `
      <div class="mt-8 pt-6 border-t border-dashed border-zinc-800">
        <div class="grid grid-cols-2 gap-px bg-zinc-800/50 rounded overflow-hidden border border-zinc-800">
          <div class="bg-zinc-900/50 p-4 hover:bg-zinc-800/50 transition-colors">
            <div class="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Requests (24h)</div>
            <div class="text-lg font-bold text-zinc-200 font-mono tracking-tight">${quota.modelUsage.totalRequests?.toLocaleString() || 0}</div>
          </div>
          <div class="bg-zinc-900/50 p-4 hover:bg-zinc-800/50 transition-colors">
            <div class="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Tokens (24h)</div>
            <div class="text-lg font-bold text-zinc-200 font-mono tracking-tight">${quota.modelUsage.totalTokens?.toLocaleString() || 0}</div>
          </div>
        </div>
      </div>
    `;
  }

  return html;
}
