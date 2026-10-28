import { useEffect, useMemo, useState } from 'react';
import { identities } from './data/identities';
import './App.css';

const STORAGE_KEY = 'limbus-planner-owned';

const sinners = [ 
   'イサン',  
  'ファウスト', 
   'ドンキホーテ',
    '良秀',
    'ムルソー',
    'ホンル',
    'ヒースクリフ',
    'イシュメール',
    'ロージャ',
    'シンクレア', 
   'ウーティス', 
   'グレゴール',
];

const rarityOptions = [ 
   { value: 'all', label: 'すべてのレアリティ' }, 
   { value: '0', label: '基本人格（0）' },  
  { value: '00', label: '星2（00）' },  
  { value: '000', label: '星3（000）' },
];

function loadOwned(): string[] {  
  try {   
     const saved = localStorage.getItem(STORAGE_KEY);    
    return saved ? JSON.parse(saved) : [];  
  } catch {   
     return [];  
  }
}

function App() {  
  const [owned, setOwned] = useState<string[]>(loadOwned);  
  const [goal, setGoal] = useState('ストーリー');
  
  // 検索・絞り込み用の状態 
  const [search, setSearch] = useState('');  
  const [selectedSinner, setSelectedSinner] = useState('all');  
  const [selectedRarity, setSelectedRarity] = useState('all');
  
  useEffect(() => {    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(owned));  
  }, [owned]);

  function toggleOwned(id: string) {    
  setOwned((current) =>      
  current.includes(id)        
  ? current.filter((item) => item !== id)        
  : [...current, id]    
  );  
}
  
// 検索語・囚人・レアリティの条件で人格一覧を絞り込む  
const filteredIdentities = useMemo(() => {    
  const keyword = search.trim().toLocaleLowerCase();
    
  return identities.filter((identity) => {      
    const matchesSearch =        
    keyword === '' ||        
    identity.name.toLocaleLowerCase().includes(keyword) ||        
    (identity.nameJa ?? '').toLocaleLowerCase().includes(keyword) ||        
    identity.sinner.toLocaleLowerCase().includes(keyword) ||        
    identity.id.toLocaleLowerCase().includes(keyword);
     
    const matchesSinner =        
    selectedSinner === 'all' || identity.sinner === selectedSinner;
      
    const matchesRarity =        
    selectedRarity === 'all' || identity.rarity === selectedRarity;
      
    return matchesSearch && matchesSinner && matchesRarity;   
  });  
}, [search, selectedSinner, selectedRarity]);
  
const recommendations = identities    
.filter((identity) => owned.includes(identity.id))    
.map((identity) => ({      
  ...identity,      
  score: identity.beginnerScore,  
}))    
.sort((a, b) => b.score - a.score);
  
function resetFilters() {    
  setSearch('');    
  setSelectedSinner('all');    
  setSelectedRarity('all');  
}
  
return(
<main className="container">     
 <header>        
  <p className="eyebrow">FAN-MADE TOOL</p>       
  <h1>育成・交換ナビ</h1>        
  <p>手持ちを整理して、次の育成目標を考えよう。</p>        
  <p className="notice">          
  非公式ファン制作の試作版です。          
  評価はあくまで個人的評価です。     
   </p>     
   </header>
     
 <section className="panel">       
 <h2>1. 攻略目標</h2>       
 <select value={goal} onChange=
{(event) => setGoal(event.target.value)}>          
<option value="ストーリー">ストーリー攻略</option>          
<option value="鏡ダンジョン">鏡ダンジョン</option>       
 </select>     
 </section>
      
<section className="panel">       
<h2>2. 所持人格</h2>        
<p>所持している人格にチェックしてください。</p>
        
<div className="filters">          
<label className="filter-field">            
<span>人格を検索</span>            
<input              
type="search"              
value={search}              
onChange={(event) => setSearch(event.target.value)}              
placeholder="名前・囚人名で検索"            
/>          
</label>
          
<label className="filter-field">            
<span>囚人で絞り込む</span>            
<select              
value={selectedSinner}              
onChange={(event) => setSelectedSinner(event.target.value)} 
>              
<option value="all">すべての囚人</option>              
{sinners.map((sinner) => (                
<option value={sinner} key={sinner}>                  
{sinner}                
</option>              
))}            
</select>         
</label>
          
<label className="filter-field">            
<span>レアリティで絞り込む</span>            
<select              
value={selectedRarity}              
onChange={(event) => setSelectedRarity(event.target.value)}            
>              
{rarityOptions.map((rarity) => (                
<option value={rarity.value} key={rarity.value}>                  
{rarity.label}                
</option>              
))}            
</select>          
</label>
          
<button            
type="button"            
className="reset-filters"            
onClick={resetFilters}         
>            
絞り込みをリセット          
</button>        
</div>
        
<p className="filter-count">          
表示中：{filteredIdentities.length} / {identities.length} 人格        
</p>
        
<div className="identity-list">          
{filteredIdentities.map((identity) => (            
<label className="identity" key={identity.id}>              
<input                
type="checkbox"                
checked={owned.includes(identity.id)}                
onChange={() => toggleOwned(identity.id)}              
/>              
<span className="identity-names">               
<strong className="identity-name-ja">                  
{identity.nameJa || identity.sinner}                
</strong>                
<small className="identity-name-en">{identity.name}</small>                
<small className="identity-meta">                  
レアリティ：{identity.rarity}                
</small>              
</span>            
</label>          
))}        
</div>
        
{filteredIdentities.length === 0 && (          
<p>            
  条件に一致する人格がありません。検索語や絞り込みを変更してください。          
  </p>        
  )}
       
<p>所持登録数：{owned.length} 人格</p>      
</section>
      
<section className="panel">        
<h2>3. 優先度の試算</h2>
        
{recommendations.length === 0 ? (          
<p>まず所持人格を登録してください。</p>        
  ) : (          
  <>            
  <p>選択中の目標：{goal}</p>
            
  {recommendations.map((identity) => (
  <details className="result-details" key={identity.id}>
    <summary className="result-summary">
      <div className="result-names">
        <strong className="identity-name-ja">
          {identity.nameJa || identity.sinner}
        </strong>

        <small className="identity-name-en">
          {identity.name}
        </small>
      </div>


      <span className={`rarity rarity-${identity.rarity}`}>
  {identity.rarity === '000'
    ? '星3'
    : identity.rarity === '00'
      ? '星2'
      : '基本人格'}
</span>
<span className="score">
  評価：{identity.score}/10
</span>
</summary>

<div className="result-detail">
  <p>{identity.reason}</p>

  {identity.pros && identity.pros.length > 0 && (
    <div className="evaluation-pros">
      <strong>👍 おすすめする理由</strong>
      <ul>
        {identity.pros.map((pro, index) => (
          <li key={index}>{pro}</li>
        ))}
      </ul>
    </div>
  )}

  {identity.cons && identity.cons.length > 0 && (
    <div className="evaluation-cons">
      <strong>⚠️ 注意点</strong>
      <ul>
        {identity.cons.map((con, index) => (
          <li key={index}>{con}</li>
        ))}
      </ul>
    </div>
  )}
</div>
</details>
))}

</>
  )}
</section>
      
<footer>非公式ファンツール。ゲーム運営元とは無関係です。
  </footer>    
  </main>  
  );
}

export default App;
