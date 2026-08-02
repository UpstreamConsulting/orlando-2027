(function(){
  var PARK=(document.body.dataset.park||'park');
  var PARKNAME=(document.body.dataset.parkname||'park');
  var mem={};
  function store(k,v){ try{ if(v===''||v==null) localStorage.removeItem(k); else localStorage.setItem(k,v);}catch(e){ if(v===''||v==null) delete mem[k]; else mem[k]=v; } }
  function load(k){ try{ var v=localStorage.getItem(k); return v==null?(mem[k]||''):v; }catch(e){ return mem[k]||''; } }
  var table=document.querySelector('table'); if(!table||!table.tHead) return;
  var thead=table.tHead.rows[0];
  ['My order','My notes'].forEach(function(t){ var th=document.createElement('th'); th.textContent=t; th.className='mycol'; thead.appendChild(th); });
  var colCount=thead.cells.length, tbody=table.tBodies[0], original=[].slice.call(tbody.rows);
  original.forEach(function(tr){
    if(tr.classList.contains('landrow')){ tr.cells[0].colSpan=colCount; return; }
    var numEl=tr.querySelector('.num'), nameEl=tr.querySelector('.aname');
    var id=numEl?numEl.textContent.trim():'';
    if(!id||id==='★'){ id=(nameEl?nameEl.textContent:'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,24); }
    var kO='orlando:'+PARK+':'+id+':order', kN='orlando:'+PARK+':'+id+':note';
    tr.dataset.name=nameEl?nameEl.textContent.trim():id;
    var tdO=document.createElement('td'); tdO.className='mycol';
    var inO=document.createElement('input'); inO.type='text'; inO.setAttribute('inputmode','numeric'); inO.className='myorder'; inO.placeholder='—'; inO.value=load(kO);
    inO.addEventListener('input',function(){ store(kO,inO.value.trim()); });
    tdO.appendChild(inO); tr.appendChild(tdO);
    var tdN=document.createElement('td'); tdN.className='mycol';
    var inN=document.createElement('input'); inN.type='text'; inN.className='mynote'; inN.placeholder='notes…'; inN.value=load(kN);
    inN.addEventListener('input',function(){ store(kN,inN.value); });
    tdN.appendChild(inN); tr.appendChild(tdN);
  });
  var flash=document.getElementById('flash');
  function say(m){ if(!flash)return; flash.textContent=m; flash.hidden=false; setTimeout(function(){ flash.hidden=true; },2200); }
  var sorted=false, sortBtn=document.getElementById('sortBtn');
  sortBtn&&sortBtn.addEventListener('click',function(){
    if(!sorted){
      var attr=original.filter(function(r){ return !r.classList.contains('landrow'); });
      attr.sort(function(a,b){ var av=parseFloat(a.querySelector('.myorder').value), bv=parseFloat(b.querySelector('.myorder').value); return (isNaN(av)?1e9:av)-(isNaN(bv)?1e9:bv); });
      original.forEach(function(r){ if(r.classList.contains('landrow')) r.style.display='none'; });
      attr.forEach(function(r){ tbody.appendChild(r); });
      sorted=true; sortBtn.textContent='Back to map order';
    } else {
      original.forEach(function(r){ r.style.display=''; tbody.appendChild(r); });
      sorted=false; sortBtn.textContent='Sort by my order';
    }
  });
  var copyBtn=document.getElementById('copyBtn');
  copyBtn&&copyBtn.addEventListener('click',function(){
    var items=original.filter(function(r){ return !r.classList.contains('landrow'); })
      .map(function(r){ return {o:parseFloat(r.querySelector('.myorder').value), name:r.dataset.name, note:r.querySelector('.mynote').value}; })
      .filter(function(x){ return !isNaN(x.o); }).sort(function(a,b){ return a.o-b.o; });
    if(!items.length){ say('Enter some order numbers first'); return; }
    var txt='My '+PARKNAME+' plan\n'+items.map(function(x){ return x.o+'. '+x.name+(x.note?' — '+x.note:''); }).join('\n');
    function done(){ say('Copied '+items.length+' items ✓'); }
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(done,function(){ fb(txt,done); }); } else fb(txt,done);
  });
  function fb(txt,cb){ var ta=document.createElement('textarea'); ta.value=txt; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); cb(); }catch(e){ window.prompt('Copy your plan:',txt); } document.body.removeChild(ta); }
  var clearBtn=document.getElementById('clearBtn');
  clearBtn&&clearBtn.addEventListener('click',function(){
    if(!window.confirm('Clear all your order numbers and notes on this device?')) return;
    original.forEach(function(r){ var o=r.querySelector('.myorder'), n=r.querySelector('.mynote'); if(o){ o.value=''; o.dispatchEvent(new Event('input')); } if(n){ n.value=''; n.dispatchEvent(new Event('input')); } });
    say('Cleared');
  });
})();
