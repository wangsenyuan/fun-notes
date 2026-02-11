(()=>{
  const ID = 'notes_v1'
  const $ = sel => document.querySelector(sel)
  const $$ = sel => document.querySelectorAll(sel)

  function loadNotes(){
    try{
      const raw = localStorage.getItem(ID)
      return raw? JSON.parse(raw) : []
    }catch(e){return []}
  }

  function saveNotes(list){
    localStorage.setItem(ID, JSON.stringify(list))
  }

  function uid(){return Date.now().toString(36)}

  function render(filterText=''){
    const list = loadNotes()
    const ul = $('#notes-list')
    ul.innerHTML = ''
    const q = filterText.trim().toLowerCase()
    const filtered = list.filter(n=>{
      if(!q) return true
      return (n.title||'').toLowerCase().includes(q) || (n.body||'').toLowerCase().includes(q) || (n.tags||[]).join(' ').toLowerCase().includes(q)
    }).sort((a,b)=>b.updated - a.updated)

    for(const n of filtered){
      const li = document.createElement('li')
      li.className = 'note-item'
      li.dataset.id = n.id
      li.innerHTML = `<div><strong>${escapeHtml(n.title||'(no title)')}</strong></div>`+
                     `<div class="meta">${new Date(n.updated).toLocaleString()} ${n.tags?'-':''} ${(n.tags||[]).map(t=>`<span class=\"tag\">${escapeHtml(t)}</span>`).join('')}</div>`
      li.addEventListener('click',()=>loadIntoEditor(n.id))
      ul.appendChild(li)
    }
  }

  function escapeHtml(s){return String(s).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]))}

  function loadIntoEditor(id){
    const list = loadNotes()
    const n = list.find(x=>x.id===id)
    if(!n) return
    $('#note-title').value = n.title||''
    $('#note-tags').value = (n.tags||[]).join(', ')
    $('#note-body').value = n.body||''
    $('#save-note').dataset.edit = n.id
  }

  function clearEditor(){
    $('#note-title').value=''
    $('#note-tags').value=''
    $('#note-body').value=''
    delete $('#save-note').dataset.edit
  }

  function saveFromEditor(){
    const title = $('#note-title').value.trim()
    const tags = $('#note-tags').value.split(',').map(s=>s.trim()).filter(Boolean)
    const body = $('#note-body').value
    const list = loadNotes()
    const now = Date.now()
    const editId = $('#save-note').dataset.edit
    if(editId){
      const idx = list.findIndex(x=>x.id===editId)
      if(idx!==-1){
        list[idx].title = title
        list[idx].tags = tags
        list[idx].body = body
        list[idx].updated = now
      }
    }else{
      list.push({id: uid(), title, tags, body, created: now, updated: now})
    }
    saveNotes(list)
    render($('#search').value)
    clearEditor()
  }

  function removeNote(id){
    let list = loadNotes()
    list = list.filter(x=>x.id!==id)
    saveNotes(list)
    render($('#search').value)
  }

  function exportNotes(){
    const data = localStorage.getItem(ID) || '[]'
    const blob = new Blob([data],{type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'notes.json'
    a.click(); URL.revokeObjectURL(url)
  }

  function importNotesFile(file){
    const r = new FileReader()
    r.onload = e=>{
      try{
        const imported = JSON.parse(e.target.result)
        if(Array.isArray(imported)){
          saveNotes(imported)
          render()
          alert('Imported '+imported.length+' notes')
        }else alert('Invalid file format')
      }catch(err){alert('Invalid JSON')}
    }
    r.readAsText(file)
  }

  // wire UI
  document.addEventListener('DOMContentLoaded',()=>{
    render()
    $('#save-note').addEventListener('click',saveFromEditor)
    $('#new-note').addEventListener('click',clearEditor)
    $('#search').addEventListener('input',e=>render(e.target.value))
    $('#export-notes').addEventListener('click',exportNotes)
    $('#import-notes').addEventListener('click',()=>$('#import-file').click())
    $('#import-file').addEventListener('change',e=>{
      const f = e.target.files && e.target.files[0]
      if(f) importNotesFile(f)
      e.target.value = ''
    })
    // long-press delete: double-click a note to delete
    document.getElementById('notes-list').addEventListener('dblclick',e=>{
      const li = e.target.closest('.note-item')
      if(!li) return
      if(confirm('Delete this note?')) removeNote(li.dataset.id)
    })
  })

})();
