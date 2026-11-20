const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) files.push(...walk(full));
    else if (f === 'route.ts') files.push(full);
  }
  return files;
}

const adminDir = 'src/app/api/admin';
const routes = walk(adminDir);
let patched = 0;

for (const file of routes) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('async function checkAdmin')) { console.log('Skip:', file); continue; }

  // Remove the local checkAdmin function body
  content = content.replace(/\nasync function checkAdmin\(\) \{[\s\S]*?return profile\?\.role === 'admin' \? user : null\n\}\n/m, '\n');

  // Fix imports — ensure checkAdmin is imported from shared helper
  // Case 1: both imports on consecutive lines
  content = content
    .replace(
      "import { createClient } from '@/lib/supabase/server'\nimport { createAdminClient } from '@/lib/supabase/admin'",
      "import { createAdminClient } from '@/lib/supabase/admin'\nimport { checkAdmin } from '@/lib/auth/checkRole'"
    )
    .replace(
      "import { createAdminClient } from '@/lib/supabase/admin'\nimport { createClient } from '@/lib/supabase/server'",
      "import { createAdminClient } from '@/lib/supabase/admin'\nimport { checkAdmin } from '@/lib/auth/checkRole'"
    );

  // Case 2: only createClient remains (no adminClient import yet replaced it)
  if (content.includes("from '@/lib/supabase/server'") && !content.includes("from '@/lib/auth/checkRole'")) {
    content = content.replace(
      "import { createClient } from '@/lib/supabase/server'",
      "import { checkAdmin } from '@/lib/auth/checkRole'"
    );
  }

  // If checkAdmin import already there but createClient still exists, remove it
  if (content.includes("from '@/lib/auth/checkRole'") && content.includes("from '@/lib/supabase/server'")) {
    content = content.replace(/import \{ createClient \} from '@\/lib\/supabase\/server'\n/, '');
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Patched:', file);
  patched++;
}
console.log('Total patched:', patched);
