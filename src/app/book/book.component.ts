import { Component, OnInit } from '@angular/core';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';
import { BookService } from './book.service';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
@Component({
  selector: 'ngx-book',
  templateUrl: './book.component.html',
  providers: [
    BookService
  ]
})
export class BookComponent implements OnInit {

  data = {
        "$addFields": {
          "convertedId": {
            "$convert": {
              "input": "{%_id%}",
              "to": "objectId"
            }
          },
          "sendTo": "{%rule.sendTo|__BODY%}",
          "fakeEmail": "{%FAKE_CLIENT_EMAIL|__GC%}",
          "beneId": {
            "$convert": {
              "input": "{%rule.payload._id|__BODY~OBJECT_ID%}",
              "to": "objectId"
            }
          }
        },
        "$match": {
          "$and": [
            {
              "$expr": {
                "$eq": [
                  "$_id",
                  "$convertedId"
                ]
              }
            }
          ]
        },
        "$lookup": {
          "from": "funeralhomes",
          "let": {
            "fhNum": "$FHNum"
          },
          "pipeline": [
            {
              "$match": {
                "$expr": {
                  "$eq": [
                    "$fhNum",
                    "$$fhNum"
                  ]
                }
              }
            },
            {
              "$project": {
                "fhName": 1,
                "fhContactFirstName": 1,
                "fhContactMiddleName": 1,
                "fhContactLastName": 1,
                "fhLicense": 1,
                "fhPhoneNumber": 1,
                "fhFaxNumber": 1,
                "fhTaxID": 1,
                "fhAddr1": 1,
                "fhAddr2": 1,
                "fhCity": 1,
                "fhState": 1,
                "fhZip": 1,
                "fhEmail": 1
              }
            }
          ],
          "as": "fh"
        },
        "$unwind": {
          "path": "$fh",
          "preserveNullAndEmptyArrays": true
        },
        "$project": {
          "Beneficiaries": {
            "$filter": {
              "input": "$Beneficiaries",
              "as": "bene",
              "cond": {
                "$eq": [
                  "$$bene._id",
                  "$beneId"
                ]
              }
            }
          },
          "polNum": 1,
          "multiPol": 1,
          "multiPolId": 1,
          "prefillData": 1,
          "fieldData": 1,
          "PDInsuredDOB": {
            "$ifNull": [
              "$prefillData.insuredDOB",
              null
            ]
          },
          "FDInsuredDOB": {
            "$ifNull": [
              "$fieldData.insuredDOB",
              null
            ]
          },
          "PDFuneralRep": {
            "$ifNull": [
              "$prefillData.FuneralRep",
              null
            ]
          },
          "FDFuneralRep": {
            "$ifNull": [
              "$fieldData.FuneralReps",
              null
            ]
          },
          "fh": 1,
          "sendTo": 1,
          "correspondence": 1,
          "fakeEmail": 1
        },
        "$unwind": {
          "path": "$Beneficiaries",
          "preserveNullAndEmptyArrays": true
        },
        "$lookup": {
          "from": "caseloads",
          "localField": "multiPolId",
          "foreignField": "_id",
          "as": "caseloads"
        },
        "$match": {
          "$or": [
            {
              "caseloads._id": "$convertedId"
            },
            {
              "caseloads.status": {
                "$nin": [
                  "epr",
                  "rtp",
                  "pyr",
                  "trm"
                ]
              }
            }
          ]
        },
        "$project": {
          "_id": 0,
          "causeofdeath": "$prefillData.causeofdeath",
          "is_the_policy_has_home_away_benefit": "$prefillData.is_the_policy_has_home_away_benefit",
          "is_the_funeral_home_requesting_entire_benefit": "$prefillData.is_the_funeral_home_requesting_entire_benefit",
          "is_the_away_from_home_benefit_being_applied_for_": "$prefillData.is_the_away_from_home_benefit_being_applied_for_",
          "funeralhomerequest": "$prefillData.funeralhomerequest",
          "what_is_the_specific_amount": "$prefillData.what_is_the_specific_amount",
          "userProvidedDOB": {
            "$switch": {
              "branches": [
                {
                  "case": {
                    "$and": [
                      {
                        "$ne": [
                          "$PDInsuredDOB",
                          null
                        ]
                      },
                      {
                        "$ne": [
                          "$PDInsuredDOB",
                          ""
                        ]
                      }
                    ]
                  },
                  "then": "$PDInsuredDOB"
                }
              ],
              "default": "$FDInsuredDOB"
            }
          },
          "FamilyRep": {
            "$switch": {
              "branches": [
                {
                  "case": {
                    "$and": [
                      {
                        "$ne": [
                          "$PDFamilyRep",
                          null
                        ]
                      },
                      {
                        "$ne": [
                          "$PDFamilyRep",
                          ""
                        ]
                      }
                    ]
                  },
                  "then": "$PDFamilyRep"
                }
              ],
              "default": "$FDFamilyRep"
            }
          },
          "v_datDeath": {
            "$dateToString": {
              "format": "%m/%d/%Y",
              "date": {
                "$toDate": "$prefillData.v_datDeath"
              }
            }
          },
          "polNum": {
            "$switch": {
              "branches": [
                {
                  "case": {
                    "$and": [
                      {
                        "$ne": [
                          "$multiPol",
                          null
                        ]
                      },
                      {
                        "$ne": [
                          "$multiPol",
                          []
                        ]
                      }
                    ]
                  },
                  "then": {
                    "$reduce": {
                      "input": "$multiPol",
                      "initialValue": {
                        "$cond": [
                          {
                            "$anyElementTrue": {
                              "$map": {
                                "input": "$multiPol",
                                "as": "el",
                                "in": {
                                  "$eq": [
                                    "$$el",
                                    "$polNum"
                                  ]
                                }
                              }
                            }
                          },
                          "",
                          "$polNum"
                        ]
                      },
                      "in": {
                        "$concat": [
                          "$$value",
                          {
                            "$cond": {
                              "if": {
                                "$eq": [
                                  "$$value",
                                  ""
                                ]
                              },
                              "then": "",
                              "else": ", "
                            }
                          },
                          "$$this"
                        ]
                      }
                    }
                  }
                }
              ],
              "default": "$polNum"
            }
          },
          "insuredFName": "$fieldData.insuredFName",
          "insuredMName": "$fieldData.insuredMName",
          "insuredLName": "$fieldData.insuredLName",
          "InsuredName": {
            "$concat": [
              {
                "$ifNull": [
                  "$fieldData.insuredFName",
                  ""
                ]
              },
              " ",
              {
                "$ifNull": [
                  "$fieldData.insuredLName",
                  ""
                ]
              }
            ]
          },
          "SSN": "$fieldData.insuredSSN",
          "insuredDOB": "$fieldData.insuredDOB",
          "fhName": "$fh.fhName",
          "fhContactFirstName": "$fh.fhContactFirstName",
          "fhContactMiddleName": "$fh.fhContactMiddleName",
          "fhContactLastName": "$fh.fhContactLastName",
          "fhLicense": "$fh.fhLicense",
          "fhPhoneNumber": "$fh.fhPhoneNumber",
          "PhoneNo": "$fh.fhPhoneNumber",
          "fhFaxNumber": "$fh.fhFaxNumber",
          "fhTaxID": "$fh.fhTaxID",
          "fhAdd": {
            "$concat": [
              "$fhAddr1",
              ", ",
              "$fhCity",
              ", ",
              "$fhState",
              ", ",
              "$fhZip"
            ]
          },
          "fhFullAddress": {
            "$concat": [
              "$fh.fhAddr1",
              ", ",
              "$fh.fhCity",
              ", ",
              "$fh.fhState",
              ", ",
              "$fh.fhZip"
            ]
          },
          "fhAddr2": "$fh.fhAddr2",
          "fhCity": "$fh.fhCity",
          "fhState": "$fh.fhState",
          "fhZip": "$fh.fhZip",
          "beneficiaryFirstName": "$Beneficiaries.FirstName",
          "beneficiaryEmail": "$Beneficiaries.Email",
          "participant": {
            "$switch": {
              "branches": [
                {
                  "case": {
                    "$eq": [
                      "$sendTo",
                      "staff"
                    ]
                  },
                  "then": [
                    {
                      "userFirstName": "$fh.fhName",
                      "userLastName": "",
                      "userEmail": "$fh.fhEmail"
                    }
                  ]
                },
                {
                  "case": {
                    "$eq": [
                      "$sendTo",
                      "bene"
                    ]
                  },
                  "then": [
                    {
                      "userFirstName": "$Beneficiaries.FirstName",
                      "userLastName": "$Beneficiaries.LastName",
                      "userEmail": "$Beneficiaries.Email",
                      "userPhone": "$Beneficiaries.PhoneNumber"
                    }
                  ]
                },
                {
                  "case": {
                    "$eq": [
                      "$sendTo",
                      "fh"
                    ]
                  },
                  "then": [
                    {
                      "userFirstName": "$fh.fhContactFirstName",
                      "userLastName": "",
                      "userEmail": {
                        "$ifNull": [
                          "$correspondence.preferredEmail",
                          {
                            "$ifNull": [
                              "$fh.fhContactEmail",
                              {
                                "$ifNull": [
                                  "$fh.fhEmail",
                                  "$fakeEmail"
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    }
                  ]
                }
              ],
              "default": [
                {
                  "userFirstName": "Fh",
                  "userLastName": "last Name",
                  "userEmail": "$fakeEmail"
                }
              ]
            }
          }
        }
  };

  dropdownEnabled = true;
  items: TreeviewItem[];
  values: number[];
  config = TreeviewConfig.create({
    hasAllCheckBox: true,
    hasFilter: true,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 400
  });

  buttonClasses = [
    'btn-outline-primary',
    'btn-outline-secondary',
    'btn-outline-success',
    'btn-outline-danger',
    'btn-outline-warning',
    'btn-outline-info',
    'btn-outline-light',
    'btn-outline-dark'
  ];
  buttonClass = this.buttonClasses[0];

  constructor(
    private service: BookService
  ) { }

  ngOnInit(): void {
    this.items = this.service.getBooks();
  }

  onFilterChange(value: string): void {
    console.log('filter:', value);
  }
}
