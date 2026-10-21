// src/scorm/parseManifest.js

const local = (n) => n.localName || n.nodeName.split(':').pop();
const all = (el, name) => [...el.getElementsByTagNameNS('*', name)];
const kids = (el, name) => [...el.children].filter((c) => local(c).toLowerCase() === name.toLowerCase());
const kidText = (el, name) => kids(el, name)[0]?.textContent.trim() || '';
const attr = (el, name) => {
  for (const a of el.attributes) {
    if (local(a).toLowerCase() === name.toLowerCase()) return a.value;
  }
  return null;
};

function detectVersion(root) {
  const schemaVersion = (all(root, 'schemaversion')[0]?.textContent || '').trim().toLowerCase();
  if (schemaVersion === '1.2') return '1.2';
  if (/2004|cam\s*1\.3|^1\.3/.test(schemaVersion)) return '2004';

  const rootAttrs = [...root.attributes].map((a) => a.value).join(' ');
  if (/adlcp_v1p3|adlseq|adlnav|imsss/i.test(rootAttrs)) return '2004';
  if (/adlcp_rootv1p2/i.test(rootAttrs)) return '1.2';

  for (const r of all(root, 'resource')) {
    for (const a of r.attributes) {
      if (local(a).toLowerCase() === 'scormtype') {
        return local(a) === 'scormType' ? '2004' : '1.2';
      }
    }
  }
  return '1.2';
}

export function parseManifest(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText.replace(/^\s+/, ''), 'application/xml');

  if (doc.getElementsByTagName('parsererror').length) {
    throw new Error('imsmanifest.xml is not valid XML.');
  }

  const root = doc.documentElement;
  const version = detectVersion(root);

  const resources = new Map(
    all(root, 'resource').map((r) => [attr(r, 'identifier'), r])
  );

  const launchable = (item) => {
    const res = resources.get(attr(item, 'identifierref'));
    return !!res && !!res.getAttribute('href');
  };

  const firstLaunchItem = (parent) => {
    for (const child of parent.children) {
      if (local(child) !== 'item') continue;
      if (launchable(child)) return child;
      const deeper = firstLaunchItem(child);
      if (deeper) return deeper;
    }
    return null;
  };

  const orgs = all(root, 'organization');
  const defaultId = attr(all(root, 'organizations')[0] || root, 'default');
  const org = orgs.find((o) => attr(o, 'identifier') === defaultId) || orgs[0];

  let item = org ? firstLaunchItem(org) : null;
  let resource = item ? resources.get(attr(item, 'identifierref')) : null;

  if (!resource) {
    const withHref = [...resources.values()].filter((r) => r.getAttribute('href'));
    resource =
      withHref.find((r) => (attr(r, 'scormtype') || '').toLowerCase() === 'sco') ||
      withHref[0];
  }

  if (!resource) {
    throw new Error('The manifest does not contain a launchable resource.');
  }

  const base =
    (root.getAttribute('xml:base') || '') +
    (all(root, 'resources')[0]?.getAttribute('xml:base') || '') +
    (resource.getAttribute('xml:base') || '');

  return {
    version,
    title: (org && kidText(org, 'title')) || (item && kidText(item, 'title')) || 'SCORM course',
    href: base + resource.getAttribute('href'), // should be "index_lms.html"
    parameters: (item && attr(item, 'parameters')) || '',
    launchData: (item && kidText(item, 'dataFromLMS')) || '',
    masteryScore: (item && kidText(item, 'masteryscore')) || '',
    scaledPassingScore: (item && all(item, 'minNormalizedMeasure')[0]?.textContent.trim()) || '',
  };
}
// export async function loadCourse(file) {
//   let res
//   try {
//     res = await fetch('/api/upload', { method: 'POST', body: file })
//   } catch {
//     throw new Error('Could not reach the local server. Is "npm run dev" still running?')
//   }
//   const body = await res.json().catch(() => ({}))
//   if (!res.ok) throw new Error(body.error || `Upload failed (${res.status}).`)

//   const manifestUrl = `/courses/${body.id}/${body.manifestPath.split('/').map(encodeURIComponent).join('/')}`
//   const manifestRes = await fetch(manifestUrl)
//   if (!manifestRes.ok) throw new Error('Could not read imsmanifest.xml from the extracted course.')
//   const parsed = parseManifest(await manifestRes.text())

//   return {
//     id: body.id,
//     title: parsed.title,
//     version: parsed.version,
//     launchUrl: buildLaunchUrl(body.id, body.manifestPath, parsed),
//     launchData: parsed.launchData,
//     masteryScore: parsed.masteryScore,
//     scaledPassingScore: parsed.scaledPassingScore,
//   }
// }
