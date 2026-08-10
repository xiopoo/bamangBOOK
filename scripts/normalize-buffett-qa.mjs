import fs from 'node:fs';
import path from 'node:path';

const dir = 'content/qa';
const replacements = [
  ['就是是', '就是'],
  ['这么做了了', '这么做了'],
  ['我目前我可以告诉你的', '我目前可以告诉你的'],
  ['我们的管理层们', '我们的管理层'],
  ['美国各家企业的经理人的', '美国各家企业经理人的'],
  ['无论如何也不会比企业得到更好的回报', '无论如何也不可能获得高于企业本身的回报'],
  ['Dinerclub', 'Diners Club'],
  ['FARICHILD', 'Fairchild'],
  ['GETCO', 'GEICO'],
  ['Ilinois National Bank', 'Illinois National Bank'],
  ['National Indermnity', 'National Indemnity'],
  ['quota share reinsuane', 'quota-share reinsurance'],
  ['米老师不会', '米老鼠不会'],
  ['呆险业务', '保险业务'],
  ['现钟不打反去炼铜', '舍近求远'],
];

let changed = 0;
for (const name of fs.readdirSync(dir)) {
  if (!/^伯克希尔股东大会实录_\d{4}\.md$/.test(name)) continue;
  const file = path.join(dir, name);
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [from, to] of replacements) after = after.split(from).join(to);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
}
console.log(JSON.stringify({ changed, replacements: replacements.length }));
