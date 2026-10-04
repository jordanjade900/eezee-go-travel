import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import { writeFile } from 'node:fs/promises';
const port=Number(process.env.AUDIT_PORT||9223);
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',args:[`--remote-debugging-port=${port}`],headless:true});
try{
  const result=await lighthouse(process.env.TEST_URL||'http://127.0.0.1:4173',{port,output:'json',onlyCategories:['performance','accessibility','best-practices','seo'],logLevel:'error'});
  await writeFile('docs/lighthouse.json',result.report);
  console.log(JSON.stringify({scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([key,value])=>[key,value.score])),LCP:result.lhr.audits['largest-contentful-paint'].displayValue,CLS:result.lhr.audits['cumulative-layout-shift'].displayValue},null,2));
}finally{await browser.close();}
