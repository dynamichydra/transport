'use strict';

(function () {

  const popup = document.getElementById("sitePopup");
  let settings = [];
  let docType=null
  init();

  async function init() {
    getSettings();
    bindEvents();
  }

  function bindEvents() {
    $('#sitePopup').off('click');
    $('#sitePopup').on('click','#closePopup',function(){
      popup.style.display = "none";
    });
    // $('.editsetting').on('click',settingsPopup);
    $('#sitePopup').on('click','.saveBtn',saveSetting);
    $('#tblsetting').on('click','[data-edit]',editSetting);
    $('#tblsetting').on('click',`[data-logo]`,function(){
      docType="logo"
      documentPopup($(this).attr('data-logo'));
    });
    $('#tblsetting').on('click',`[data-signature]`,function(){
      docType="signature"
      documentPopup($(this).attr('data-signature'));
    });
    $('#sitePopup').on('click','.docUploadBtn',docUpload);
  }

  function getSettings(){
    let cnd=[];
    backendSource.getObject('settings', null, {where:cnd}, function (data) {
      if(data.SUCCESS){
        settings = data.MESSAGE;
        console.log(settings);
        $('#tblsetting tbody').html('');
        if(data.MESSAGE.length>0){
          data.MESSAGE.map((e)=>{
            $('#tblsetting tbody').append(`
              <tr>
            <td scope="col">Logo</td>
            <td scope="col"> <img style="width:80px; padding:5px; background-color:green" src=${DM_CORE_CONFIG.SERVER_URL +"files/"+ e.logo}/><span class="actionBtn ms-5" data-logo="${e.id}"><i class="bi bi-files"></i></span></td>
          </tr>
          <tr>
            <td scope="col">Address</td>
            <td scope="col">${e.address}</td>
          </tr>
          <tr>
            <td scope="col">Phone Number</td>
            <td scope="col">${e.ph}</td>
          </tr>
          <tr>
            <td scope="col">Email</td>
            <td scope="col">${e.email}</td>
          </tr>
          <tr>
            <td scope="col">Name</td>
            <td scope="col">${e.name}</td>
          </tr>
          <tr>
            <td scope="col">Signature</td>
            <td scope="col"> <img style="width:50px" src=${DM_CORE_CONFIG.SERVER_URL +"files/"+ e.signature}/> <span class="actionBtn ms-5" data-signature="${e.id}"><i class="bi bi-files"></i></span></td>
          </tr>
          <tr>
            <td scope="col">Designation</td>
            <td scope="col">${e.designation}</td>
          </tr>
          <tr>
            <td scope="col">Action</td>
            <td scope="col" data-edit=${e.id}> <div class="gameButton editsetting m-0" ><i class="bi bi-pencil-square"></i></i> </div></td>
          </tr>
            `);
          });
        }else{
          $('#tblsetting tbody').append(`
              <tr>
                <td colspan="9">No record found</td>
              </tr>
            `);
        }
      }
    });
  }

  function editSetting(){
    let uid = $(this).attr('data-edit');
    const setting = settings.find((e)=>{return e.id==uid});
    
    $(`#sitePopup`).html(`<div class="popup-content" style="max-width:900px">
        <span class="close" id="closePopup">&times;</span>
        <h2>Setting</h2>
        <div class="container">
          <div class="row">
           <!-- <div class="col-4 mt-3">Logo</div>
            <div class="col-8 mt-3 input-container">
              <input type="file" class="sLogo" id="docFileUpload" value="${setting?setting.logo:''}"/>
            </div> -->
            <div class="col-4 mt-3">Address</div>
            <div class="col-8 mt-3 input-container">
            <input type="text" class="sAddress" value="${setting?setting.address:''}"/>
            </div>
            <div class="col-4 mt-3">Phone Number</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="sPh" value="${setting?setting.ph:''}"/>
            </div>
            <div class="col-4 mt-3">Email</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="sEmail" value="${setting?setting.email:''}"/>
            </div>
            <div class="col-4 mt-3">Name</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="sName" value="${setting?setting.name:''}"/>
            </div>
            <!--<div class="col-4 mt-3">Signature</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="sSignature" value="${setting?setting.signature:''}"/>
            </div> -->
            <div class="col-4 mt-3">Designation</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="sDesignation" value="${setting?setting.designation:''}"/>
            </div>
            <div class="col-4 mt-3">&nbsp;</div>
            <div class="col-8 mt-3"><span class="gameButton saveBtn"> Save </span></div>
            <input type="hidden" class="uId" value="${setting?setting.id:''}"/>
          </div>
        </div>
      </div>`);

      popup.style.display = "block";
  }

  async function saveSetting(){
    let id = $('.uId').val();
    // let fileInput = document.getElementById('docFileUpload');
    // let file = fileInput.files[0];

    // let formData = new FormData();
    // formData.append('file', file);
    // formData.append('folder', 'doc');

    // backendSource.fileUpload(formData,function(data){
    //   if(data.MESSAGE && data.MESSAGE.filename){
         
          backendSource.saveObject('settings', id, {
           "name":$('.sName').val(),
           "email": $('.sEmail').val(),
           "ph":$('.sPh').val(),
           "address":$('.sAddress').val(),
           "designation":$('.sDesignation').val(),
          }, function (data) {
          if(data.SUCCESS){
            DM_TEMPLATE.showSystemNotification(1, `setting uploaded successfully.`);
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          }else{
            DM_TEMPLATE.showSystemNotification(0, `Unable to upload setting.`);
          }
  })
}

function documentPopup(uid){
  console.log(docType);
      $(`#sitePopup`).html(`<div class="popup-content" style="max-width:900px">
        <span class="close" id="closePopup">&times;</span>
        <h2 style="text-transform: capitalize;">${docType} Image</h2>
        <div class="container">
          <div class="row">
            <div class="col-12 mt-5">
              <div class="docUploadArea row">
               
                  <input type="hidden" class="uId" value="${uid}"/>
                
                <div class="col-4 mt-3">Document</div>
                <div class="col-8 mt-3 input-container">
                  <input type="file" accept="image/png" class="docFile" id="docFileUpload"/>
                </div>
                <div class="col-4 mt-3">&nbsp;</div>
                <div class="col-8 mt-3"><span class="gameButton docUploadBtn"> Upload </span></div>
              </div>
            </div>
            
          </div>
        </div>
      </div>`);
      popup.style.display = "block"; 
}

function docUpload(){
    let eId = $('.uId').val();
    let fileInput = document.getElementById('docFileUpload');
    let file = fileInput.files[0];

    if(!eId || eId==''){
      DM_TEMPLATE.showSystemNotification(0, `No employee found.`);
      return;
    }
    if(!file || file==''){
      DM_TEMPLATE.showSystemNotification(0, `Please select a file to upload.`);
      return;
    }

    DM_TEMPLATE.showBtnLoader(elq('.docUploadBtn'), true);
    let formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'doc');
     backendSource.fileUpload(formData,function(data){
      if(data.MESSAGE && data.MESSAGE.filename){
        backendSource.saveObject('settings',eId, {
            [docType]:data.MESSAGE.filename
          }, function (data) {
          if(data.SUCCESS){
            DM_TEMPLATE.showSystemNotification(1, `Document uploaded successfully.`);
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          }else{
            DM_TEMPLATE.showSystemNotification(0, `Unable to upload document.`);
          }
        });
      }
    });
}

})();
