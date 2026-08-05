import { renderToString } from '@antv/infographic/ssr';
import { writeFileSync } from 'fs';

async function main() {
  const svg = await renderToString({
    width: 800,
    height: 1100,
    theme: 'dark',
    background: '#FAF8F4',
    data: [
      { label: '企业所有权', value: '第一性原理' },
      { label: '内在价值', value: '现金流折现' },
      { label: '所有者收益', value: '经济现实' },
      { label: '安全边际', value: '纪律与耐心' },
      { label: '能力圈', value: '认知边界' },
      { label: '护城河', value: '竞争优势' },
      { label: '资本配置', value: '复利引擎' },
      { label: '市场先生', value: '情绪利用' },
    ],
    design: 'structure',
    title: '巴菲特投资框架',
  });
  writeFileSync('/tmp/test-infographic.svg', svg);
  console.log('SVG generated:', svg.substring(0, 200));
}

main().catch(console.error);