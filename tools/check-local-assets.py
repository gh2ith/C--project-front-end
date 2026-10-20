from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json
root=Path(__file__).resolve().parents[1]
missing=[]
class Links(HTMLParser):
    def handle_starttag(self,tag,attrs):
        for key,value in attrs:
            if key not in ['href','src','poster'] or not value:continue
            url=urlsplit(value)
            if url.scheme or url.netloc or not url.path:continue
            target=(current.parent/unquote(url.path)).resolve()
            if not target.exists():missing.append([str(current.relative_to(root)),value])
files=list((root/'pages').rglob('*.html'))+[root/'index.html']
for current in files:Links().feed(current.read_text(encoding='utf-8'))
seed=json.loads((root/'shared/data/firebase-seed.json').read_text(encoding='utf-8'))
assert len(seed['university']['majors'])==6
assert {u['role'] for u in seed['users'].values()}=={'student','company','supervisor','coordinator'}
assert 'password' not in json.dumps(seed).lower()
for uid,u in seed['users'].items():
    if u['role']=='student':assert u['groupId'] in seed['groups'] and u['majorId'] in seed['university']['majors']
for group in seed['groups'].values():assert seed['users'][group['supervisorId']]['role']=='supervisor'
for op in seed['opportunities'].values():assert op['companyId'] in seed['companies'] and seed['users'][op['supervisorId']]['role']=='company'
print('HTML files checked:',len(files),'Missing local references:',len(missing))
print(json.dumps(missing,indent=2))
assert not missing
print('Firebase seed: six majors, exactly four roles, valid relations, no passwords.')
