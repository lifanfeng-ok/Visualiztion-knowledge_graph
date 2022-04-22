import story_arr from "./data.js";

document.addEventListener('DOMContentLoaded',function () {
    let ul = document.querySelector('ul');
   let right_div = document.querySelector('.right');
   let arr = story_arr;
   let html = '';
   let current_li_index=0;
   let current_div_index=0;
   arr.forEach((obj,index) =>{
      // create li(left) and div (right)
         if (index === 0) {
              html = html + `<li class="active"`+` data-index=${index+1}><p class="header">
                 ${obj.header}</p>
                 <p class="text">`+createText(obj.text)+`</p>
                 <div class="footer">
                 <button class="previous" disabled>Previous</button>
                 <select class="story_selection" name="story_id">`+ createOptions(index)+ `                   
                 </select>
                 <button class="next">Next</button>
                 </li></div> `;
              let div = document.createElement('div');
              let div_html = `<div class="info_box">`+createImgs(index)+`</div><div class="graph_area"></div>`
              div.className='story active';
              div.innerHTML=div_html;
              div.setAttribute('data-index',(index+1).toString());
              right_div.appendChild(div);
         } else {
             if (index === arr.length-1){
                 html += `<li`+` data-index="${index+1}"><p class="header">
                 ${obj.header}</p>
                   <p class="text">`+createText(obj.text)+`</p>
                   <div class="footer">
                   <button class="previous">Previous</button>
                   <select class="story_selection" name="story_id">`+createOptions(index)+`                   
                   </select>
                   <button class="next" disabled>Next</button>
                   </li></div> `;
             } else {
                   html += `<li`+` data-index="${index+1}"><p class="header">
                 ${obj.header}</p>
                 <p class="text">`+createText(obj.text)+`</p>
                 <div class="footer">
                 <button class="previous">Previous</button>
                 <select class="story_selection" name="story_id">`+ createOptions(index)+
                       `</select>
                 <button class="next">Next</button>
                 </li></div> `;
             }
             let div = document.createElement('div');
             let div_html = `<div class="info_box">`+createImgs(index)+`</div><div class="graph_area"></div>`
             div.className='story'
             div.innerHTML=div_html;
             div.setAttribute('data-index',(index+1).toString());
             right_div.appendChild(div);
         }

   })
   ul.innerHTML = html;
   let next_buttons = document.querySelectorAll('.next');
   let previous_buttons = document.querySelectorAll('.previous');
   let selections = document.querySelectorAll('.story_selection');
   let li_list = document.querySelectorAll('li');
   let div_list = document.querySelectorAll('.right .story');
   next_buttons.forEach((item,index) => {
          item.addEventListener('click', (e) =>{
                     li_list[index].className ='';
                     li_list[index+1].className='active';
                     div_list[index].className='story';
                     console.log(div_list[index+1])
                     div_list[index+1].className='story active';
                     current_li_index = index+1;

          })
   })

   previous_buttons.forEach((item,index)=>{
            item.addEventListener('click', (e) =>{
                     li_list[index].className ='';
                     li_list[index-1].className='active';
                     div_list[index].className='story';
                     div_list[index-1].className='story active';
                     current_li_index = index-1;

          })
   })

   selections.forEach((item,index)=>{
           item.addEventListener('change',()=>{
                 let index = item.selectedIndex;
                 let value = item.options[index].value;
                 let target_selec_obj = selections[value];
                 target_selec_obj.options[value].selected =true;
                 li_list[current_li_index].className = '';
                 div_list[current_li_index].className='story';
                 selections[current_li_index].options[current_li_index].selected=true;
                 li_list[value].className='active';
                 div_list[value].className='story active';
                 current_li_index = value;
           })
   })

    function createImgs(index) {
          return arr[index].infoBox.reduce((pre,current)=>{
                   if(current.image_URL!=='') {
                        return pre+`<img class="image" alt="Images" `+`src=${current.image_URL} />`
                   } else {
                       return ''
                   }
          },'')
    }

   function createText(text) {
         return text.reduce((pre,current)=>{
                 if(pre==='') {
                      return pre+`${current}`
                 } else {
                    return pre+ `\n\n${current}`
                 }
         },'')
   }


   function createOptions(index) {
        let len = arr.length;
        let optionStr = '';
        for(let i=0; i<=len-1;i++) {
              if(i===index) {
                optionStr += `<option `+`value=${i} selected>${i+1}:${story_arr[i].header}</option>`
              } else {
                optionStr += `<option `+`value=${i}>${i+1}:${story_arr[i].header}</option>`
              }
        }
        return optionStr
   }
})

