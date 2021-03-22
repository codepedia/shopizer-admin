import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { ConfigService } from '../../shared/services/config.service';
import { ToastrService } from 'ngx-toastr';
// import { TaxService } from '../services/tax.service';
let canadapost = require('../services/canadapost.json');
let upsData = require('../services/ups.json');
let customRulesData = require('../services/customrules.json');
let storePickUpData = require('../services/storepickup.json');
let weightBased = require('../services/weightbased.json');
import { SharedService } from '../services/shared.service';
import { async } from 'q';
// let braintreeData = require('../services/braintree.json');
@Component({
  selector: 'ngx-shipping-configure',
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss'],
})
export class ShippingConfigureComponent implements OnInit {

  active = '';
  formData: Array<any> = [];
  loadingList: boolean = false;
  shippingType: any;
  shippingData: any;
  editorConfig = {
    placeholder: '',
    tabsize: 2,
    height: 300,
    toolbar: [
      ['misc', ['codeview', 'undo', 'redo']],
      ['style', ['bold', 'italic', 'underline', 'clear']],
      ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
      ['fontsize', ['fontname', 'fontsize', 'color']],
      ['para', ['style', 'ul', 'ol', 'paragraph', 'height']],
      ['insert', ['table', 'picture', 'link', 'video']],
      ['customButtons', ['testBtn']]
    ],
    // buttons: {
    //   'testBtn': this.customButton.bind(this)
    // },
    fontNames: ['Helvetica', 'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Roboto', 'Times']
  };
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService
  ) {
    // this.getCountry();
    // this.getLanguages();
  }
  ngOnInit() {
    let type = this.activatedRoute.snapshot.paramMap.get('id');
    console.log(type);
    if (type == 'canadapost') {
      this.formData = canadapost;
      this.shippingType = "Canada Post";
    }
    else if (type == 'ups') {
      this.formData = upsData;
      this.shippingType = "UPS";
    }
    else if (type == 'weightBased') {
      this.formData = weightBased;
      this.shippingType = 'Weight Based Shipping Price'
    }
    else if (type == 'customQuotesRules') {
      this.formData = customRulesData;
      this.shippingType = 'Shipping by Fresh Organics '
    }
    else if (type == 'priceByDistance') {
      this.formData = customRulesData;
      this.shippingType = 'Shipping by Fresh Organics'
    }
    else if (type == 'storePickUp') {
      this.formData = storePickUpData;
      this.shippingType = 'Store Pick Up'
    }
    this.getShippingConfigureDetails(type)
  }
  getShippingConfigureDetails(type) {
    this.loadingList = true;
    this.sharedService.getShippingModulesDetails(type)
      .subscribe(data => {
        console.log(data);
        this.loadingList = false;
        this.shippingData = data;
        this.setConfigureData();
      }, error => {
        this.loadingList = false;
      });
  }
  setConfigureData() {

    this.formData.map(async (value, i) => {

      if (value.type == 'radio') {
        // console.log(Array.isArray(this.shippingData[value.objectKey][value.name]))
        this.formData[i].value = this.shippingData[value.objectKey][value.name][0]
      } else if (value.type == 'groupcheckbox') {
        if (value.objectKey == '') {

        } else {
          this.shippingData[value.objectKey][value.name].map((option) => {
            let a = value.optionData.findIndex((a) => a.value === option)
            // console.log(a)
            value.optionData[a].checked = true;
          })

        }
      } else {
        this.formData[i].value = value.objectKey == '' ? this.shippingData[value.name] : this.shippingData[value.objectKey][value.name]
      }
    });
  }
  save() {
    // console.log(this.formData)
    let type = this.activatedRoute.snapshot.paramMap.get('id');
    let param: any = {};
    this.formData.map((value) => {
      // console.log(value.value)
      if (value.objectKey === "integrationOptions") {
        let a = value.optionData.filter((a) => { return a.checked === true }).map(function (obj) {
          return obj.value;
        });;
        // console.log(a)
        param[value.name] = a
      } else {
        param[value.name] = value.value
      }
    });
    console.log(param)
    let body: any = {};
    if (type == "canadapost") {
      body = { 'code': type, 'active': param.active, 'defaultSelected': param.defaultSelected, 'integrationKeys': { 'account': param.account, 'apikey': param.apikey, 'password': param.password, 'username': param.username }, 'integrationOptions': { 'services-domestic': param['services-domestic'], 'services-intl': param['services-intl'], 'services-usa': param['services-usa'] } }
    }
    this.saveShippingData(body)
  }
  saveShippingData(body) {
    console.log(body)
    this.loadingList = true;
    this.sharedService.saveShippingMethods(body)
      .subscribe(data => {
        console.log(data);
        this.loadingList = false;
        this.toastr.success('Shipping methods has been saved successfully.');
      }, error => {
        this.loadingList = false;
      });
  }

  goBack() {
    this.router.navigate(['pages/shipping/methods']);
  }
}
