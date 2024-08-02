'use strict';

(function () {

  const popup = document.getElementById("sitePopup");
  let users = [];
  init();

  async function init() {
    getUsers();
    bindEvents();
  }

  function bindEvents() {
    $('#sitePopup').off('click');
    $('#sitePopup').on('click', '#closePopup', function () {
      popup.style.display = "none";
    });
    $('.createUser').on('click', userPopup);
    $('#sitePopup').on('click', '.saveBtn', saveUser);
    $('.searchUser').on('click', getUsers);
    $('#tblUser').on('click', `[data-editid]`, userPopup);
    $('#tblUser').on('click', `[data-statusid]`, statusPopup);
    $('#tblUser').on('click', `[data-document]`, function () {
      documentPopup($(this).attr('data-document'));
    });
    $('#sitePopup').on('click', '.statusSaveBtn', statusSave);
    $('#sitePopup').on('click', '.docUploadBtn', docUpload);
    $('#sitePopup').on('click', '[data-downloaddoc]', downloadDoc);
    $('#sitePopup').on('click', '[data-deletedoc]', deleteDoc);
  }

  function getUsers() {
    DM_TEMPLATE.showBtnLoader(elq('.searchUser'), true);
    let uEmail = $('#uEmail').val();
    let uName = $('#uName').val();
    let uPh = $('#uPhone').val();
    let uStatus = $('#uStatus').find(":selected").val();
    let cnd = [];
    if (uEmail && uEmail != '') {
      cnd.push({ 'key': 'email', 'operator': 'like', 'value': uEmail })
    }
    if (uName && uName != '') {
      cnd.push({ 'key': 'name', 'operator': 'like', 'value': uName })
    }
    if (uPh && uPh != '') {
      cnd.push({ 'key': 'ph', 'operator': 'like', 'value': uPh })
    }
    if (uStatus && uStatus != '') {
      cnd.push({ 'key': 'status', 'operator': 'is', 'value': uStatus })
    }
    backendSource.getObject('employee', null, { where: cnd }, function (data) {
      if (data.SUCCESS) {
        users = data.MESSAGE;
        $('#tblUser tbody').html('');
        if (data.MESSAGE.length > 0) {
          data.MESSAGE.map((e) => {
            $('#tblUser tbody').append(`
              <tr>
                <td>${e.id}</td>
                <td>${e.name}</td>
                <td >${e.email}</td>
                <td >${e.ph}</td>
                <td>${e.type}</td>
                <td class="${e.status == 1 ? 'enable' : 'disable'}">${e.status == 1 ? 'Enable' : 'Disable'}</td>
                <td style="display:flex;">
                  <span class="actionBtn" data-document="${e.id}"><i class="bi bi-files"></i></span>
                  <span class="actionBtn" data-editid="${e.id}"><i class="bi bi-pencil-square"></i></span>
                  <span class="actionBtn" data-statusid="${e.id}"><i class="bi ${e.status == 1 ? 'bi-lock' : 'bi-unlock'}"></i></span>
                  
                </td>
              </tr>
            `);
          });
        } else {
          $('#tblUser tbody').append(`
              <tr>
                <td colspan="9">No record found</td>
              </tr>
            `);
        }
      }
      DM_TEMPLATE.showBtnLoader(elq('.searchUser'), false);
    });
  }

  function userPopup() {
    const uid = $(this).attr('data-editid');
    const user = users.find((e) => { return e.id == uid });

    $(`#sitePopup`).html(`<div class="popup-content" style="max-width:900px">
        <span class="close" id="closePopup">&times;</span>
        <h2>Employee</h2>
        <div class="container">
          <div class="row">
            <div class="col-4 mt-3">Name</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="uName" value="${user ? user.name : ''}"/>
            </div>
            <div class="col-4 mt-3">Phone</div>
            <div class="col-8 mt-3 input-container">
            <input type="text" class="uPh" value="${user ? user.ph : ''}"/>
            </div>
            <div class="col-4 mt-3">Alternate Number</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="ph_alt" value="${user ? user.ph_alt : ''}"/>
            </div>
            <div class="col-4 mt-3">Email</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="uEmail" value="${user ? user.email : ''}"/>
            </div>
            <div class="col-4 mt-3">Address</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="uAddress" value="${user ? user.address : ''}"/>
            </div>
            <div class="col-4 mt-3">Type</div>
            <div class="col-8 mt-3 input-container">
              <select class="uType">
                <option value="admin" ${user && user.type == 'admin' ? `selected` : ``}>Admin</option>
                <option value="accounts" ${user && user.type == 'accounts' ? `selected` : ``}>Accounts</option>
                <option value="hr" ${user && user.type == 'hr' ? `selected` : ``}>HR</option>
                <option value="user" ${user && user.type == 'user' ? `selected` : ``}>User</option>
              </select>
            </div>
            <div class="col-4 mt-3">Password</div>
            <div class="col-8 mt-3 input-container">
              <input type="password" class="uPwd"/>
              <input type="hidden" class="uId" value="${user ? user.id : ''}"/>
            </div>
            <div class="col-4 mt-3">&nbsp;</div>
            <div class="col-8 mt-3"><span class="gameButton saveBtn"> Save </span></div>
          </div>
        </div>
      </div>`);

    popup.style.display = "block";
  }

  async function saveUser() {
    DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), true);
    let id = $('.uId').val();

    if (id && id.trim() != '') {
      backendSource.saveObject('employee', id, {
        name: $('.uName').val(),
        ph: $('.uPh').val(),
        email: $('.uEmail').val(),
        ph_alt: $('.ph_alt').val(),
        address: $('.uAddress').val(),
        type: $('.uType').val()
      }, function (data) {
        if (data.SUCCESS) {
          let pwd = $('.uPwd').val();
          if (pwd && pwd.trim() != '') {
            backendSource.customRequest('auth', id, {
              pwd: pwd,
              grant_type: 'changepasswordadmin'
            }, function (data) {

              if (!data.SUCCESS) {
                DM_TEMPLATE.showSystemNotification(0, data.MESSAGE);
              }
            });
          }
          DM_TEMPLATE.showSystemNotification(1, `Profile updated successfully.`);
          popup.style.display = "none";
          window.location.reload();
        } else {
          DM_TEMPLATE.showSystemNotification(0, `Unable to update. Please try again.`);
        }
        DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), false);
      });
    } else {
      backendSource.customRequest('auth', null, {
        name: $('.uName').val(),
        ph: $('.uPh').val(),
        email: $('.uEmail').val(),
        ph_alt: $('.ph_alt').val(),
        address: $('.uAddress').val(),
        type: $('.uType').val(),
        pwd: $('.uPwd').val(),
        grant_type: 'register'
      }, function (data) {
        DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), false);
        if (data.SUCCESS !== true) {
          DM_TEMPLATE.showSystemNotification(0, data.MESSAGE);
          return false;
        }
        DM_TEMPLATE.showSystemNotification(1, 'Data updated successfully');
        popup.style.display = "none";
        window.location.reload();
      });
    }
  }

  function downloadDoc() {
    window.open(DM_CORE_CONFIG.SERVER_URL + 'files/' + $(this).attr('data-name'), '_blank');
  }

  function deleteDoc() {
    if (confirm("Do you really want to delete the document?") == true) {

      backendSource.customRequest('utility', $(this).attr('data-deletedoc'), {
        name: $(this).attr('data-name'),
        grant_type: 'delete_doc',
        obj: 'emp_doc',
      }, function (data) {
        console.log(data)
        documentPopup($('.uId').val());
        DM_TEMPLATE.showSystemNotification(data.SUCCESS ? 1 : 0, data.MESSAGE);
      });
    }
  }

  function docUpload() {
    let title = $('.docTitle').val();
    let eId = $('.uId').val();
    let fileInput = document.getElementById('docFileUpload');
    let file = fileInput.files[0];

    if (!title || title == '') {
      DM_TEMPLATE.showSystemNotification(0, `Please provide the title.`);
      return;
    }
    if (!eId || eId == '') {
      DM_TEMPLATE.showSystemNotification(0, `No employee found.`);
      return;
    }
    if (!file || file == '') {
      DM_TEMPLATE.showSystemNotification(0, `Please select a file to upload.`);
      return;
    }

    DM_TEMPLATE.showBtnLoader(elq('.docUploadBtn'), true);
    let formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'doc');

    backendSource.fileUpload(formData, function (data) {
      if (data.MESSAGE && data.MESSAGE.filename) {
        backendSource.saveObject('emp_doc', null, {
          emp_id: eId,
          doc_title: title,
          doc: data.MESSAGE.filename
        }, function (data) {
          if (data.SUCCESS) {
            documentPopup(eId);
            DM_TEMPLATE.showSystemNotification(1, `Document uploaded successfully.`);
          } else {
            DM_TEMPLATE.showSystemNotification(0, `Unable to upload document.`);
          }
          DM_TEMPLATE.showBtnLoader(elq('.docUploadBtn'), false);
        });
      }
    });
  }

  function getIconExt(ext) {
    let htm = '';
    switch (ext.toLowerCase()) {
      case 'pdf':
        htm = `<i class="bi bi-file-earmark-pdf"></i>`;
        break;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        htm = `<i class="bi bi-image"></i>`;
        break;
      case 'doc':
      case 'docx':
        htm = `<i class="bi bi-file-earmark-word"></i>`;
        break;
      case 'xls':
      case 'xlsx':
        htm = `<i class="bi bi-file-earmark-x"></i>`;
        break;
      case 'txt':
        htm = `<i class="bi bi-file-text"></i>`;
        break;
      default:
        htm = `<i class="bi bi-file-ruled"></i>`;
        break;
    }
    return htm;
  }

  function documentPopup(uid) {
    backendSource.getObject('emp_doc', null, {
      where: [
        { 'key': 'emp_id', 'operator': 'is', 'value': uid }
      ]
    }, function (data) {
      let htm = '';
      if (data.MESSAGE.length > 0) {
        htm += `<div class="docItems">`;
        for (let item of data.MESSAGE) {
          let ext = item.doc.split('.');
          htm += `<div class="docItem">
            <div class="docType"><span>${getIconExt(ext[ext.length - 1])}</span></div>
            <div class="docName">${item.doc_title}</div>
            <div class="docAction">
              <span data-name="${item.doc}" data-downloadDoc="${item.id}"><i class="bi bi-download"></i></span>
              <span data-name="${item.doc}" data-deleteDoc="${item.id}"><i class="bi bi-trash"></i></span>
            </div>
          </div>`;
        }
        htm += `</div>`;
      } else {
        htm = `<div class="noDocFound">No document found.</div>`;
      }
      $(`#sitePopup`).html(`<div class="popup-content" style="max-width:900px">
        <span class="close" id="closePopup">&times;</span>
        <h2>Employees Document</h2>
        <div class="container">
          <div class="row">
            <div class="col-12 mt-3">
              ${htm}
            </div>
            <div class="col-12 mt-5">
              <div class="docUploadArea row">
                <div class="col-4 mt-3">Document Title</div>
                <div class="col-8 mt-3 input-container">
                  <input type="text" class="docTitle" value=""/>
                  <input type="hidden" class="uId" value="${uid}"/>
                </div>
                <div class="col-4 mt-3">Document</div>
                <div class="col-8 mt-3 input-container">
                  <input type="file" class="docFile" id="docFileUpload"/>
                </div>
                <div class="col-4 mt-3">&nbsp;</div>
                <div class="col-8 mt-3"><span class="gameButton docUploadBtn"> Upload </span></div>
              </div>
            </div>
            
          </div>
        </div>
      </div>`);

      popup.style.display = "block";
    });

  }

  function statusPopup() {
    const uid = $(this).attr('data-statusid');
    const user = users.find((e) => { return e.id == uid });
    $(`#sitePopup`).html(`<div class="popup-content">
        <span class="close" id="closePopup">&times;</span>
        <h2>Change status</h2>
        <div class="container">
          <div class="row">
            <div class="col-4 mt-3">Name</div>
            <div class="col-8 mt-3 input-container">${user ? user.name : ''}</div>
            <div class="col-4 mt-3">Phone Number</div>
            <div class="col-8 mt-3 input-container">${user ? user.ph : ''}</div>
            <div class="col-4 mt-3">Status</div>
            <div class="col-8 mt-3 input-container">
            <select type="text" class="cStatus">
              <option ${user && user.status == 1 ? 'selected' : ''} value="1">Enable</option>
              <option ${user && user.status != 1 ? 'selected' : ''} value="2">Disable</option>
            </select>
            <input type="hidden" class="uId" value="${user ? user.id : ''}"/>
            </div>
            <div class="col-4 mt-3">&nbsp;</div>
            <div class="col-8 mt-3"><span class="gameButton statusSaveBtn"> Save </span></div>
          </div>
        </div>
      </div>`);

    popup.style.display = "block";
  }

  async function statusSave() {
    DM_TEMPLATE.showBtnLoader(elq('.statusSaveBtn'), true);
    let id = $('.uId').val();

    if (id && id.trim() != '') {

      backendSource.customRequest('auth', null, {
        id: id,
        status: $('.cStatus').find(":selected").val(),
        grant_type: 'statuschange'
      }, async function (data) {
        DM_TEMPLATE.showBtnLoader(elq('.statusSaveBtn'), false);
        if (data.SUCCESS) {
          DM_TEMPLATE.showSystemNotification(1, `Status updated successfully.`);
          popup.style.display = "none";
          setTimeout(function () {
            window.location.reload();
          }, 1000);
        } else {
          DM_TEMPLATE.showSystemNotification(0, `Unable to update. Please try again.`);
        }
      });

    }
  }

})();