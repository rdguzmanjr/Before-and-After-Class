/*

usage:
       
  
   var bnaImgBounds={top:30.8,right:88.5,bottom:63.4,left:11.5}; // image bounds
   var anchorImgBounds={top:30.7,right:54.0,bottom:63.4,left:46.0}; // anchor bounds
   //You can copy bounds from here: https://get-png-transform-origin.onrender.com/

        var bnaEntries={card1:['.card-1','before1.png','after1.png'],  // container, before image, after image
                       //card2:['.card-2','before2.png','after2.png'],
                       //card3:['.card-3','before3.png','after3.png'],   
                       }
        var bna1=new bna(bnaEntries,'.anchorHScontainer','anchor.png',bnaImgBounds,anchorImgBounds); // container for the anchor hotspot and anchor image
        
*/  
class bna {
    constructor(config_obj,anchor_cont,anchor_img,b_obj,a_obj,inFlex=true){
            this.config_obj=config_obj;
            this.anchor_cont=document.querySelector(anchor_cont);
            this.anchor_img=anchor_img;
            this.b_obj=b_obj;
            this.a_obj=a_obj;
            this.elemArr=[];
            this.anchorArr=[];
            this.afterArr=[];
            this.inFlex=inFlex;
            this.init();
        }
    
    init(){
        if(!this.inFlex){
            this.b_obj=this.unflex(this.b_obj);
            this.a_obj=this.unflex(this.a_obj);
        }
        //createElement
        Object.entries(this.config_obj).forEach(entry => {
            const [key, value] = entry;
            this.elemArr.push(this.createDivElement(value[0],value[1],value[2],this.anchor_img));
        });
        //create anchor-hs
        let anchorHS=document.createElement('div');
        anchorHS.style.backgroundColor='#ff000080';
        anchorHS.style.width=`${this.a_obj.right-this.a_obj.left+2}%`;
        anchorHS.style.height=`${this.a_obj.bottom-this.a_obj.top}%`;
        anchorHS.style.top=`${this.a_obj.top}%`;
        anchorHS.style.left=`${this.b_obj.left-4}%`;
        anchorHS.style.pointerEvents = "all";
        anchorHS.classList.add('.bnaAnchorHS'); 
        this.anchor_cont.appendChild(anchorHS);
        //create bounds
        let bnaBounds=document.createElement('div');
        //bnaBounds.classList.add('.flex-items'); 
         bnaBounds.style.backgroundColor='#ff000060';
        bnaBounds.style.width=`${((this.b_obj.right-this.b_obj.left)+8)}%`;
        bnaBounds.style.height=`${this.b_obj.bottom-this.b_obj.top}%`;
        bnaBounds.style.top=`${this.b_obj.top}%`;
        bnaBounds.style.left=`${this.b_obj.left-4}%`;
        this.anchor_cont.appendChild(bnaBounds);
       
        //create
        this.elemArr.forEach((e)=>{
           this.anchorArr.push(e.anchorImage);
           this.afterArr.push(e.afterImage);
        })
        this.activateDrag(anchorHS,bnaBounds,this.afterArr,this.anchorArr)
    }
    
    activateDrag(anchorHS,bnaBounds,afterDiv,anchorDiv){

        let anchorPos=this.b_obj.left-((this.a_obj.right+this.a_obj.left)/2);
        let boundsW=this.b_obj.right-this.b_obj.left;
        
        let dragObj=Draggable.create(anchorHS, {
            type:"x",
            force3D : false,
            bounds: bnaBounds,
            zIndexBoost : false,
            callbackScope:this,
            onDrag : function () {
               let getPosX=dragObj[0].x/dragObj[0].maxX*boundsW;
               let perc = getPosX + anchorPos; 
               let perc2 = getPosX + this.b_obj.left;
               gsap.set (anchorDiv, { left :`${perc}%` })
               gsap.set (afterDiv, { clipPath : `polygon(0% 0%, ${perc2}% 0%,${perc2}% 100%, 0% 100%)`})
            },
            onDragEnd: function() {
                this.syncUp ({ track : 'Knob Drag End'});
            }
        });
        return dragObj;
    }
    createDivElement(container,img_before,img_after,img_anchor){
        const cont_i=document.querySelector(container);
        const bf_el=this.createDiv(img_before);
        const af_el=this.createDiv(img_after);
        const an_el=this.createDiv(img_anchor);
        af_el.style.clipPath = `polygon(${this.b_obj.left}% 0, ${this.b_obj.left}% 0, ${this.b_obj.left}% 100%, ${this.b_obj.left}% 100% )`;
        an_el.style.left=`${this.b_obj.left-((this.a_obj.right+this.a_obj.left)/2)}%`;
        cont_i.appendChild(bf_el);
        cont_i.appendChild(af_el);
        cont_i.appendChild(an_el);
        return {afterImage:af_el,anchorImage:an_el}
    }
    createDiv(img){
        let el=document.createElement('div');
        el.style.background = `url('images/${img}') no-repeat center center`;
        el.style.backgroundSize = 'contain';
        return el;
    }
    animate(ref=this){
        gsap.to (ref.elemArr[0].afterImage, { clipPath:`polygon(${ref.b_obj.left}% 0, ${ref.b_obj.right}% 0, ${ref.b_obj.right}% 100%, ${ref.b_obj.left}% 100%)`, yoyo : true, repeat: 1, duration : 1.2, ease : 'linear' })
        gsap.to (ref.elemArr[0].anchorImage, { xPercent:ref.b_obj.right-ref.b_obj.left, yoyo : true, repeat: 1, duration : 1.2, ease : 'linear' })
    }
    resetAnchor(ref=this){
        ref.afterArr.forEach((e)=>{
            e.style.clipPath = `polygon(${ref.b_obj.left}% 0, ${ref.b_obj.left}% 0, ${ref.b_obj.left}% 100%, ${ref.b_obj.left}% 100% )`;
        })
        ref.anchorArr.forEach((e)=>{
            e.style.left=`${ref.b_obj.left-((ref.a_obj.right+ref.a_obj.left)/2)}%`;
        })
        gsap.set('.bnaAnchorHS',{x:0});
    }
     unflex(elem){ 
        let _left= elem.left;
        let _top = elem.top;
        let _right = elem.right;
        let _bottom =elem.bottom;
        let flexw=gsap.getProperty('.flex', "width");
        let contw=gsap.getProperty('.container', "width");
        let flexh=gsap.getProperty('.flex', "height");
        let conth=gsap.getProperty('.container', "height");
        if(contw>flexw){
        _left = ((flexw * _left/ 100 + (contw - flexw) / 2) / contw)*100;
        _right= ((flexw * _right/ 100 + (contw - flexw) / 2) / contw)*100;
        }
        if(conth>flexh){
        _top = ((flexh * _top / 100 + (conth - flexh) / 2) / conth)*100;
        _bottom=((flexh * _bottom / 100 + (conth - flexh) / 2) / conth)*100;
        }
        return {left:_left,right:_right,top:_top,bottom:_bottom}
    }
    syncUp (data) {
        console.log ( data );
        window.parent.postMessage ( data, '*');
    }
   
}


