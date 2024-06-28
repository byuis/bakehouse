let currentPurchase=null
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
            newRow.dataset.name=item.name
            cell.addEventListener("click", toggleDetails);
            
            let span = document.createElement('span')
            span.appendChild(document.createTextNode("keyboard_arrow_down"))
            span.className="material-icons"
            cell.prepend(span)
            addCell(newRow,"$" + item.price)

            if(item.display===1){
                cell = addCell(newRow,qtyList())
                cell.className = "qty"
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
            if(item.imgWidth){
              img.width=item.imgWidth
            }
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
    resetPmt()
  let elem=evt.target
  while(elem.tagName !== "TD"){
    elem=elem.parentNode
  }
  elem = elem.nextElementSibling
  console.log(evt.target.value)
  if(evt.target.value==0){
    elem.replaceChildren()
  }else{
    elem.innerHTML = money(elem.dataset.price * evt.target.value)
  }
  
  let orderTotal=0
  for(const rowTotal of document.querySelectorAll(".rowTotal")){
    let tot=parseFloat(rowTotal.innerHTML.replace("$",""))
    if(isNaN(tot)){tot=0}
    if(tot>0){
        orderLine(rowTotal, tot)
        console.log(tot)
        console.log("tot", typeof tot, tot, isNaN(tot))
    }
    orderTotal += tot
  }
  tag("total").replaceChildren(money(orderTotal))
  console.log(currentPurchase)
}

function orderLine(rowTotal, lineAmount){
    let elem=rowTotal
    while(elem.tagName !== "TR"){
      elem=elem.parentNode
    }
    let qty = elem.querySelector("select").value
    console.log(qty)
    currentPurchase.push(qty + " " + elem.dataset.name + ": " +money(lineAmount))
      
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

function pay(style){


    if(!currentPurchase){return}
    tag("founder").style.display="none"
    tag("payment").style.display="none"
    tag("reset").style.display="block"


    for(const cell of document.querySelectorAll(".qty")){
        console.log("cell",cell)
        const val = cell.firstElementChild.value
        if(val===0){
            cell.replaceChildren()
        }else{
            cell.replaceChildren(val)
        }
    }

    const orderText=currentPurchase.join("\n")
    const orderTotal = parseFloat(tag("total").innerHTML.replace("$",""))

    if(style==='venmo'){
        window.open("https://venmo.com/spafv?txn=pay&amp;amount="+orderTotal+"&amp;note=" + encodeURIComponent(orderText));
    }
    const payload={
        customer:tag("founderName").value,
        order:orderText,
        total:orderTotal
    }
    console.log(payload)
    submitOrder(payload)

}



function resetPmt(){
    tag("pay-cash").style.display="none"
    tag("pay-venmo").style.display="none"
    currentPurchase=[]
}

async function submitOrder(payload){
    const deployment_id = "AKfycbxJRt15UzYPrZNc-Md_btlJ0v5IloyeR4T4gyyvskeSz5XNP-BrhXzRx8F1fOx3txXJ3w"
    const gas_end_point="https://script.google.com/macros/s/" + deployment_id + "/exec"
    


    const options = { 
        method: "POST", 
        body: JSON.stringify(payload),
    }

    const reply = await fetch(gas_end_point, options)
    //The request is made of Google App Script and the response is set to "response"
    const response = await reply.text()
    console.log(response)

}


function showPmt(){
    console.log("i'm changing")
    const founder = tag("founderName")
    if(founder.value==='none'){
        tag("payment").style.display='none'
    }else{
        tag("payment").style.display='block'
    }
}

