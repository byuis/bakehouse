async function initialize(){
  console.log("initializing")

  const response = await fetch("menu.json");
  const menu = await response.json();
  console.log(menu);
  const orderform = tag("orderform")

  var tbodyRef = orderform.getElementsByTagName('tbody')[0];
  
  for(const category of menu){
    let newRow = tbodyRef.insertRow();
    let cell = addCell(newRow,"", "blank")
    cell.colSpan=4
    newRow = tbodyRef.insertRow();
    cell = addCell(newRow,category.category, "group")
    cell.colSpan=4
    for(const item of category.items){
        if(item.display>0){
            let newRow = tbodyRef.insertRow();
            let cell = addCell(newRow,item.name)
            cell.addEventListener("click", toggleDetails);
            
            let span = document.createElement('span')
            span.appendChild(document.createTextNode("keyboard_arrow_down"))
            span.className="material-icons"
            cell.prepend(span)
            addCell(newRow,"$" + item.price)

            if(item.display===1){
                addCell(newRow,qtyList())
                cell = addCell(newRow,null, "rowTotal")
                cell.dataset.price=item.price
            }else if(item.display===2){
                cell = addCell(newRow,"Sold Out","sold-out")
                cell.colSpan=2
            }


            newRow = tbodyRef.insertRow();
            cell = addCell(newRow,null)
            cell.colSpan=4
            newRow.style.display="none"
            const img = document.createElement("img");
            img.src = item.photo;
            cell.appendChild(img);
            cell.style.backgroundColor="white"
            cell.style.textAlign="left"
            let div=document.createElement("div");
            div.appendChild(document.createTextNode(item.description))
            cell.appendChild(div)
            div=document.createElement("div");
            div.style.marginTop="1rem"
            span = document.createElement('span')
            span.appendChild(document.createTextNode("Ingredients: "))
            span.style.fontWeight="bold"
            div.appendChild(span)
            div.appendChild(document.createTextNode(item.ingredients.join(", ")))
            cell.appendChild(div)
        }
    }

  }

//https://venmo.com/spafv?txn=pay&amp;amount=10&amp;note=water
}

function addCell(row, textOrObject, className){
    var newCell  = row.insertCell();
    if(className){newCell.className = className}
    if(textOrObject === null){
    }else if(typeof textOrObject === 'string'){
            newCell.appendChild(document.createTextNode(textOrObject));
    }else{
        newCell.appendChild(textOrObject);
    }
    return newCell
  }

function qtyList(){
    const sel = document.createElement("select");
    for(let x=0;x<50;x++){
        const opt1 = document.createElement("option");
        opt1.value = x; 
        opt1.text = x;
        sel.add(opt1, null);
    }

    sel.addEventListener("change", changeQty);

    return sel
}

function tag(id){
    return document.getElementById(id)
}

function changeQty(evt){
  console.log("at change qty", evt)
  let elem=evt.target
  while(elem.tagName !== "TD"){
    console.log(elem)
    elem=elem.parentNode
  }
  console.log(elem)
  elem = elem.nextElementSibling
  console.log(evt.target.value)
  if(evt.target.value==0){
    elem.replaceChildren()
  }else{
    elem.innerHTML = money(elem.dataset.price * evt.target.value)
  }
  
  let orderTotal=0
  console.log("ordertotal:", typeof orderTotal)
  for(const rowTotal of document.querySelectorAll(".rowTotal")){
    let tot=parseFloat(rowTotal.innerHTML.replace("$",""))
    if(isNaN(tot)){tot=0}
    console.log(tot)
    orderTotal += tot
  }
  tag("total").replaceChildren(money(orderTotal))
}

function money(num){
    return num.toLocaleString('en-US', {style: 'currency',currency: 'USD',})
}

function toggleDetails(evt){
    let elem=evt.target
    while(elem.tagName !== "TR"){
      elem=elem.parentNode
    }
    const prod=elem
    elem = elem.nextElementSibling
    if(elem.style.display==="none"){
        elem.style.display=""
        prod.querySelector(".material-icons").replaceChildren("keyboard_arrow_up")
    }else{
        elem.style.display="none"        
        prod.querySelector(".material-icons").replaceChildren("keyboard_arrow_down")
    }
  
}

function showPay(style){
    if(style==="venmo"){
        tag("pay-venmo").style.display="block"
        tag("pay-cash").style.display="none"
    }else{
        tag("pay-cash").style.display="block"
        tag("pay-venmo").style.display="none"
    }
}