const api = '/api/';
const GIS = {
  temp: '',
  auditenddate: '',
  auditstartdate: '',
  toastType: {
    Info: 'info',
    Error: 'error',
    Success: 'success',
    Warning: 'warning'
  },
  toastTitle: 'GIS Notification Service'
};
const excludeKeys = 'id, created_by, deleted_at, category';

$(document).ready(() => {
  toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  };

  function toTitleCase(str) {
    str = $.trim(str);
    str = str.replace('_', ' ');
    return str.replace(/(?:^|\s)\w/g, match => match.toUpperCase());
  }

  function Notify(toastType, toastMessage) {
    toastr[toastType](toastMessage, GIS.toastTitle);
  }

  function handleRequest(_method, _url, _data) {
    // Send a POST request
    axios({
      method: _method,
      url: _url,
      data: _data
    })
      .then((response) => {
        console.log(response);
        // response.data.pipe(fs.createWriteStream('ada_lovelace.jpg'));
      });
      // Notify(GIS.toastType.Error, _status);
  }

  $(".modal").on('hidden.bs.modal', () => {
    $('#description').val('');
    $('#activate').addClass('active');
    $('#deactivate').removeClass('active');
  });

  $('#btnMetaSave').on('click', () => {
    let _category = $('.linkactive').text();
    let _path = $('.linkactive').data('api');
    let _url = `${api + _path}/${_category}`;
    let _status = !!$('#activate').hasClass('active');
    let _data = { description: $('#description').val(), status: _status, category: _category };

    handleRequest('post', _url, _data);
    $('#metadata').modal('hide');
  });

  function populateModal(modalTitle) {
    $('#lblstatus').text(modalTitle + ' Status *');
    $('#myModalTitle').html('Setup ' + modalTitle + '.');
  }

  function createEmptyTable(tblTemplate) {
    let _caller = $('.linkactive').text();
    let data_form = $('.linkactive').data('api');

    // Populate Table Headers
    tblTemplate += '<thead><tr><th> &nbsp; </th></tr></thead>';

    // Populate Table Body
    tblTemplate += '<tbody>';
    tblTemplate += '</tbody>';

    // Populate Table Footer
    tblTemplate += `<tfoot><tr><td> <button type="button" class="btn btn-info pull-right" data-toggle="modal" data-target="#${data_form}" data-caller="${_caller}">Register ${_caller}.</button> </td></tr></tfoot>`;
    tblTemplate += '</table>';

    populateModal(_caller);
    $('#pgcontent').append(`<div class="col-sm-12 col-md-12">${tblTemplate}</div>`);
    $('#tblData').DataTable();
  }

  function createDataTable(jsonObj) {
    let tblData = '<table id="tblData" class="table table-striped table-bordered" style="width:100%; color: #999;">';

    if ($.isEmptyObject(jsonObj)) {
      createEmptyTable(tblData);
      return true;
    }

    let _keys = Object.keys(jsonObj[0]);
    let _caller = $('.linkactive').text();
    let data_form = $('.linkactive').data('api');

    // Populate Table Headers
    tblData += '<thead><tr>';
    tblData += '<th> # </th>';
    for (const j in _keys) {
      if (excludeKeys.indexOf(_keys[j]) === -1) {
        tblData += `<th>${toTitleCase(_keys[j])}</th>`;
      }
    }
    tblData += '</tr></thead>';

    // Populate Table Body
    tblData += '<tbody>';
    $.each(jsonObj, function (index, object) {
      tblData += '<tr>';
      tblData += `<td>${++index}</td>`;
      $.each(this, (key, value) => {
        if (excludeKeys.indexOf(key) === -1) {
          switch (key.toLowerCase()) {
            case 'status':
              tblData += `<td>${toTitleCase(value === true ? 'Active' : 'Inactive')}</td>`;
              break;

            case 'created_at':
            case 'updated_at':
              if (value == null) {
                tblData += '<td>&nbsp;</td>';
              } else {
                tblData += `<td>${moment(value).format('dddd Do of MMMM YYYY hh:mm:ss')}</td>`;
              }
              break;

            case 'user':
              tblData += `<td><a href="mailto:${value.email}?Subject=Hello%20again" target="_top" style="color:#01c0c8;">${toTitleCase(`${value.firstname} ${value.lastname}`)}</a></td>`;
              break;

            default:
              tblData += `<td>${toTitleCase(value)}</td>`;
          }
        }
      });
      tblData += '</tr>';
    });
    tblData += '</tbody>';

    // Populate Table Footer
    tblData += '<tfoot>';
    // tblTemplate += `<tfoot><tr><td> <button type="button" class="btn btn-info pull-right">Register new ${_caller}</button> </td></tr></tfoot>`;
    tblData += '</tfoot>';

    tblData += '</table>';
    populateModal(_caller);

    $('#pgcontent').append(`<div class="col-sm-12 col-md-12">${tblData}</div>`);
    $('#tblData').DataTable();
  }

  function loadData(_url) {
    axios.get(_url)
      .then((response) => {
        if (response.data.success) {
          createDataTable(response.data.data);
        }
        // console.log(response.headers['x-access-token']);
      })
      .catch((error) => {
        Notify(GIS.toastType.Error, error.message);
      });
  }

  $('#navlinks').on('click', 'a', function (e) {
    e.preventDefault();
    $('#pgcontent').empty();
    const _category = $(this).text();
    $('#pgHeader').html(_category);
    const _url = `${api + $(this).data('api')}/${_category}`;

    $('#navlinks li a').filter(function () {
      $(this).removeClass('linkactive');
    });

    $(this).addClass('linkactive').parent().parent()
      .addClass('in')
      .parent();
    loadData(_url);
  });

});

// $(document).ready(function() {

//     $.ajaxSetup({
//         headers:
//         {
//             "cache-control": "no-cache",
//             "content-type": "application/json",
//             "authorization": "bearer " + $('#tok').val(),
//             'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }
//     });

//     function Convert2DataTable() {

//         var tables = $.fn.dataTable.fnTables(true);

//         $(tables).each(function () {
//             $(this).dataTable().fnDestroy();
//         });

//         // Create a new Instance of the DataTable.
//         oTable = $('.dtable').DataTable({
//             destroy: true,
//         });
//     }

//     $('#dynamicModal').on('show.bs.modal', function () {
//         var modal = $(this);
//         modal.find('.modal-title').text('Setup ' + Spyder.DynamicHeader + ' Category.');
//         modal.find('.modal-body').html(Spyder.DynamicModalBody);
//     });

//     $("#dynamicModal").on('hidden.bs.modal', function () {
//         var modal = $(this);
//         Spyder.DynamicModalBody = '';
//         modal.find('.modal-body').html('');
//         modal.find('.modal-title').text('');
//         $('#modalsave').prop("disabled", false);

//         // Clear all inputs of their values
//         // $(this)
//         // .find("input,textarea,select")
//         //    .val('')
//         //    .end()
//         // .find("input[type=checkbox], input[type=radio]")
//         //    .prop("checked", "")
//         //    .end()
//         // .find("input[type=button]")
//         //    .text('Save changes')
//         //    .end();
//     });

//     $('.clickable').on("click", function () {
//         Spyder.DynamicHeader = $(this).html();
//         Spyder.local.key = $(this).data('key');
//         var jsonObj = "{" + $(this).data('rename').replace(/'/gi, '"') + "}";
//         Spyder.local.rename = $.parseJSON(jsonObj);

//         Spyder.local.uri = window.location.protocol + "//" + window.location.host + "/" + Spyder.BaseAPIUrl + $(this).data('mother');

//         var settings = {
//             "async": true,
//             "crossDomain": true,
//             "url": Spyder.local.uri.toString(),
//             "method": "GET",
//             "processData": false
//         };

//         $.ajax(settings).done(function (response) {

//             $("#dashboard_content").empty();
//             $('#pgheader').html('List of <i>' + Spyder.DynamicHeader + '\'s</i> registered so far. <button type="button" class="btn btn-primary pull-right" onclick="NewRegistration();"> Register ' + Spyder.DynamicHeader + '. </button>');

//             var Tbl = "<table id='TblRecords' class='table dtable table-condensed table-striped table-bordered table-hover table-bordered'>";

//             // Build out the Table header.
//             Tbl += "<thead><tr><th> S/N </th>";
//             $.each(response, function(key, value) {
//                 $.each(value[0], function(index, ivalue) {
//                     if (index !== Spyder.local.key) {
//                         Tbl += "<th> " + Spyder.local.rename[index] + " </th>";
//                     }
//                 });
//             });
//             Tbl += "<th> &nbsp; </th></tr></thead>";

//             // Build out the Table Body.
//             Tbl += "<tbody>";
//             $.each(response, function(key, value) {
//                 $.each(value, function(index, ivalue) {
//                     Tbl += "<tr>";
//                     Tbl += "<td> " + (index + 1) + " </td>";

//                     $.each(ivalue, function(fkey, fvalue) {
//                         if (fkey !== Spyder.local.key) {
//                             Tbl += "<td> " + fvalue + " </td>";
//                         }
//                     });

//                     // Add the Edit and Delete buttons here.
//                     Tbl += "<td>&nbsp;&nbsp;<a style='cursor:pointer' data-payload='" + JSON.stringify(ivalue) + "' onclick='EditRecord(this);'><i class='fa fa-pencil'></i></a>";
//                     Tbl += "&nbsp;&nbsp;&nbsp;&nbsp;<a style='cursor:pointer' data-payload='" + JSON.stringify(ivalue) + "' onclick='DeleteRecord(this);'><i class='fa fa-trash'></i></a></td>";
//                     Tbl += "</tr>";
//                 });
//             });
//             Tbl += "</tbody>";
//             Tbl += "</table>";

//             // replace content in dashboard_content with table content
//             $( "#dashboard_content" ).append(Tbl);

//             Convert2DataTable();
//         });
//     });

//     $('#modalsave').on('click', function() {
//         var item = {};
//         var form = $("#dataform");
//         $(this).prop("disabled", true);
//         form.validate({
//             errorPlacement: function errorPlacement(error, element) { element.before(error); }
//         });
//         form.validate().settings.ignore = ":disabled,:hidden";

//         if(form.valid()) {

//             var _mtd, _uri;
//             $(".modal-body :input").each(function(e) {
//                 var patt = new RegExp("description");
//                 if (this.id === Spyder.local.key) {
//                     id = 'id';
//                 } else if (patt.test(this.id.toLowerCase())) {
//                     id = 'description';
//                 } else {
//                     id = this.id.toLowerCase().replace(' ', '_');
//                 }

//                 item[id] = this.value;
//             });

//             if (Spyder.Action.toLowerCase() === "register") {
//                 _mtd = "POST";
//                 _uri =Spyder.local.uri;
//             } else {
//                 _mtd = "PUT";
//                 _uri =Spyder.local.uri + '/update';
//             }

//             var settings = {
//                 "async": true,
//                 "crossDomain": true,
//                 "url": _uri,
//                 "method": _mtd,
//                 "processData": false,
//                 "data": JSON.stringify(item)
//             };

//             $.ajax(settings).done(function (response) {
//                 PageReload();
//             });
//         } else {
//             $(this).prop("disabled", false);
//         }
//     });

// });

// function PageReload() {
//     $('#dynamicModal').modal('hide');
//     $('#side-menu').find('a[data-key="' + Spyder.local.key + '"]')[0].click();
// }

// function EditRecord(Ctrl) {
//     var _payload = $(Ctrl).data('payload');
//     var _id = _payload[Spyder.local.key];

//     var Tbl = "<form id='dataform' action='#'><table id='TblEdit' class='table table-condensed table-striped table-bordered table-hover table-bordered'><tbody>";
//     $.each(_payload, function(key, value) {
//         if (Spyder.local.key === key) {
//             Tbl += '<caption><input type="hidden" name="' + Spyder.local.key + '" id="' + Spyder.local.key + '" value="' + _id + '" /></caption>';
//         } else {

//             Tbl += '<tr>';
//             Tbl += '<div class="row">';
//             Tbl += '<div class="panel panel-primary">';
//             Tbl += '    <div class="panel-body">';
//             Tbl += '        <div class="col-md-12" title="' + Spyder.local.rename[key] + '">';
//             Tbl += '            <label for="' + Spyder.local.rename[key] + '"> ' + Spyder.local.rename[key] + ' *</label>';

//             switch(Spyder.local.rename[key].toLowerCase()) {
//                 case 'stateid':
//                 case 'primary category':
//                     Tbl += '            <input id="' + Spyder.local.rename[key] + '" required name="' + Spyder.local.rename[key] + '" type="number" value="' + value + '" class="form-control required" />';
//                     break;

//                 case 'status':
//                     Tbl += '            <input id="' + Spyder.local.rename[key] + '" required name="' + Spyder.local.rename[key] + '" type="text" maxlength="1" value="' + value + '" class="form-control required" />';
//                     break;

//                 default:
//                     Tbl += '            <input id="' + Spyder.local.rename[key] + '" required name="' + Spyder.local.rename[key] + '" type="text" value="' + value + '" class="form-control required" />';
//             }

//             Tbl += '        </div>';
//             Tbl += '    </div>';
//             Tbl += '</div>';
//             Tbl += '</div>';
//             Tbl += '</tr>';
//         }
//     });
//     Tbl += "</tbody></table></form>";

//     Spyder.Action = "Update";
//     Spyder.DynamicModalBody = Tbl;
//     $('#dynamicModal').modal('show');
// }

// function NewRegistration() {

//     var Tbl = "<form id='dataform' action='#'><table id='TblEdit' class='table table-condensed table-striped table-bordered table-hover table-bordered'><tbody>";
//     $.each(Spyder.local.rename, function(key, value) {
//         Tbl += '<tr>';
//         Tbl += '<div class="row">';
//         Tbl += '<div class="panel panel-primary">';
//         Tbl += '    <div class="panel-body">';
//         Tbl += '        <div class="col-md-12" title="' + Spyder.local.rename[key] + '">';
//         Tbl += '            <label for="' + Spyder.local.rename[key] + '"> ' + Spyder.local.rename[key] + ' *</label>';

//         switch(Spyder.local.rename[key].toLowerCase()) {
//             case 'stateid':
//             case 'primary category':
//                 Tbl += '            <input id="' + Spyder.local.rename[key] + '" required name="' + Spyder.local.rename[key] + '" type="number" value="" class="form-control required" />';
//                 break;

//             case 'status':
//                 Tbl += '            <input id="' + Spyder.local.rename[key] + '" required name="' + Spyder.local.rename[key] + '" type="text" maxlength="1" value="" class="form-control required" />';
//                 break;

//             default:
//                 Tbl += '            <input id="' + Spyder.local.rename[key] + '" required name="' + Spyder.local.rename[key] + '" type="text" value="" class="form-control required" />';
//         }

//         Tbl += '        </div>';
//         Tbl += '    </div>';
//         Tbl += '</div>';
//         Tbl += '</div>';
//         Tbl += '</tr>';
//     });
//     Tbl += "</tbody></table></form>";

//     Spyder.Action = "Register";
//     Spyder.DynamicModalBody = Tbl;
//     $('#dynamicModal').modal('show');
// }

// function DeleteRecord(Ctrl, RowData) {

//     var _payload = $(Ctrl).data('payload');
//     var _uri = Spyder.local.uri + '/destroy?id=' + _payload[Spyder.local.key];

//     var settings = {
//         "async": true,
//         "crossDomain": true,
//         "url": _uri.toString(),
//         "method": "DELETE",
//         "processData": false,
//     };

//     $.ajax(settings).done(function (response) {
//         if (response.Message.toLowerCase() === 'data successfully deleted.') {
//             PageReload();
//         }
//     });
// }

// function BuildSummary() {

//     // Build or initialize the structure outright
//     var dataModel = {
//         roadtype: { typedesc: $('#typedesc').val() },
//         buildingtype: { type_desc: $('#type_desc').val() },
//         Drainage: { drainagedesc: $('#drainagedesc').val() },
//         roadsurface: { surfacedesc: $('#surfacedesc').val() },
//         roadfeature: { featuredesc: $('#featuredesc').val() },
//         roadcondition: { conditiondesc: $('#conditiondesc').val() },
//         sitecondition: { conditiondesc: $('#conditiondesc').val() },
//         streetfurniture: { furnituredesc: $('#furnituredesc').val() },
//         lga: { stateid: $('#stateid').val(), thelga: $('#thelga').val() },
//         buildingapartments: { building_log: "", apartments: $('#apartments').val() },
//         primary: { pry_category: $('#pry_category').val(), pry_status: $('#pry_status').val() },
//         refusedisposal: { collectiondesc: $('#collectiondesc').val(), refuse_status: $('#refuse_status').val() },
//         roadcarriagetype: { carriagedesc: $('#carriagedesc').val(), carriagetypestatus: $('#carriagetypestatus').val() },
//         buildinglog: { house_no: $('#house_no').val(), w3w: $('w3w').val(), x_coord: $('x_coord').val(), y_coord: $('y_coord').val()},
//         secondary: { sec_category: $('#sec_category').val(), pry_category: $('#pry_category').val(), sec_status : $('#sec_status').val() },
//         buildingapartmentlogs: { buildingid: $('#buildingid').val(), apartment_use: $('#apartment_use').val(), apartment_desc: $('#apartment_desc').val() },
//     };

//     // Make an Ajax call to the server to process the dataModel
//     $.ajax({
//         url: '/store',
//         data: dataModel,
//         type: "POST",
//         dataType: 'json',
//         success: function (response) {
//             console.log(response);
//             if (response.status.toLowerCase() == 'success') {
//                 return true;
//             }
//         },
//         error: function (xhr, ajaxOptions, thrownError) {
//             alert('<strong>' + thrownError + '</strong>', 'ERROR', 'YuPay');
//         }
//     });
//     alert('PostToServer And Allow for final Mapping.')
// }
