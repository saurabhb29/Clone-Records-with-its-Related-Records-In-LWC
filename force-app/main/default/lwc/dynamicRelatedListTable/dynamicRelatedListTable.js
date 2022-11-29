import { LightningElement , api, track, wire } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import getData from '@salesforce/apex/dynamicRelatedListController.getData';
import cloneAnySobject from '@salesforce/apex/dynamicRelatedListController.cloneAnySobject';
// import fetchContactRecord from '@salesforce/apex/dynamicRelatedListController.fetchContactRecord';
// import fetchContactRecord from '@salesforce/apex/dynamicRelatedListController.fetchContactRecord';
//import pushObject from '@salesforce/apex/c/dynamicRelatedListController.pushObject';
// import {ShowToastEvent} from 'lightning/platformShowToastEvent';
// import { refreshApex } from '@salesforce/apex';
//  import cloneAccounts from '@salesforce/apex/CloneRecords.cloneAccounts';
import { NavigationMixin } from 'lightning/navigation';
export default class DynamicRelatedListTable extends NavigationMixin(LightningElement) {
    // @wire (fetchContactRecord) wireContact;
    @track availableAccounts;
    @track initialRecords;
    @track accountId;
    @api recordId;  // parent record id from record detail page
    @api objApiName; //kind of related list object API Name
    @api fieldSetName; // fieldSet containing all the required fields to display in related list
    @api criteriaFieldAPIName; // This field will be used in WHERE condition of our SOQL query
    @api showFirstColumnAsLink; //if the first column can be displayed as hyperlink
    @track recordsA;
    @track columns;   //columns for List of fields in datatable
    @track sortBy;
    @track sortDirection;
    @track tableData;   //data to show in datatable
    // @track idRecord;
    recordCount; //this shows record count inside the ()
    // @api recordId;
    
    @api selectedContactIdList=[];
    @api parentObjectName;
    @api relationshipApiName;
    @api buttonLabel;
    connectedCallback(){
        let firstTimeEntry = false;
        let firstFieldAPI;
        console.log('#####objApiName--> '+this.objApiName);
        // getContact({contactId:this.selectedId})
        // .then(result => console.log(result)).catch(err => console.log(err));
        //make an implicit call to fetch records from database
        getData({ strObjectApiName: this.objApiName,
                    strfieldSetName: this.fieldSetName,
                    criteriaField: this.criteriaFieldAPIName,
                    criteriaFieldValue: this.recordId})
        .then(data=>{        
            //get the map of fields and data
            let objStr = JSON.parse(data);   
            
            //retrieving listOfFields from the map,
            //here order is reverse of the way it has been inserted in the map
            let listOfFields= JSON.parse(Object.values(objStr)[1]);
            
            //retrieving listOfRecords from the map
            let listOfRecords = JSON.parse(Object.values(objStr)[0]);
            console.log('#####listOfRecords--> '+JSON.stringify(listOfRecords));
            let items = []; //array to prepare columns

            //if user wants to display first column as link and on click of the link it will
            //naviagte to record detail page. Below code prepare the first column with type = url
            listOfFields.map(element=>{
                //it will enter this if-block just once
                if(this.showFirstColumnAsLink !=null && this.showFirstColumnAsLink=='Yes'
                                                        && firstTimeEntry==false){
                    firstFieldAPI  = element.fieldPath; 
                    //perpare first column as hyperlink                                     
                    items = [...items ,
                                    {
                                        label: element.label, 
                                        fieldName: 'URLField',
                                        fixedWidth: 150,
                                        type: 'url', 
                                        typeAttributes: { 
                                            label: {
                                                fieldName: element.fieldPath
                                            },
                                            target: '_blank'
                                        },
                                        sortable: 'true '
                                    }
                    ];
                    firstTimeEntry = true;
                } else {
                    items = [...items ,{label: element.label, 
                        fieldName: element.fieldPath}];
                }   
            });
            //finally assigns item array to columns
            this.columns = items; 
            this.tableData = listOfRecords;

            console.log('listOfRecords',listOfRecords);
            //if user wants to display first column has link and on clicking of the link it will
            //naviagte to record detail page. Below code prepare the field value of first column
            if(this.showFirstColumnAsLink !=null && this.showFirstColumnAsLink=='Yes'){
                let URLField;
                //retrieve Id, create URL with Id and push it into the array
                this.tableData = listOfRecords.map(item=>{
                    URLField = '/lightning/r/' + this.objApiName + '/' + item.Id + '/view';
                    return {...item,URLField};                     
                });
                
                //now create final array excluding firstFieldAPI
                this.tableData = this.tableData.filter(item => item.fieldPath  != firstFieldAPI);
                
                //this.availableAccounts  = this.tableData.filter(item => item.fieldPath  != firstFieldAPI);
                this.initialRecords  = this.tableData.filter(item => item.fieldPath  != firstFieldAPI);
                
                
            }
            console.log('#####objApiName--> '+this.objApiName);
            this.recordCount = this.tableData.length;
            this.error = undefined;   
        })
        .catch(error =>{
            this.error = error;
            console.log('error',error);
            console.log('#####error--> '+JSON.stringify(error));
            console.error('error',error);
            this.tableData = undefined;
        })        
    }
  
  

    
    @track isShowModal = false;

    showModalBox() {  
        this.isShowModal = true;
    }

    hideModalBox() {  
        this.isShowModal = false;
    }
    handleSearch( event ) {

        const searchKey = event.target.value.toLowerCase();
        console.log( 'Search String is ' + searchKey );

        if ( searchKey ) {
            
            this.tableData = this.initialRecords;
            console.log( 'Account Records are ' + JSON.stringify( this.tableData ) );
            
            if ( this.tableData ) {

                let recs = [];
                
                for ( let rec of this.tableData ) {

                    console.log( 'Rec is ' + JSON.stringify( rec ) );
                    let valuesArray = Object.values( rec );
                    console.log( 'valuesArray is ' + JSON.stringify( valuesArray ) );
 
                    for ( let val of valuesArray ) {

                        console.log( 'val is ' + val );
                        let strVal = String( val );
                        
                        if ( strVal ) {

                            if ( strVal.toLowerCase().includes( searchKey ) ) {

                                recs.push( rec );
                                break;
                        
                            }

                        }

                    }
                    
                }

                console.log( 'Matched Accounts are ' + JSON.stringify( recs ) );
                this.tableData = recs;

             }
 
        }  else {

            this.tableData = this.initialRecords;

        }        

    }
    selectedRowsHandler(event){
        const selectedContactRows=event.detail.selectedRows;
        console.log('selectedContactRows# ' + this.selectedContactRows);
        this.selectedContactRows=[];
        for(let i=0;i<selectedContactRows.length;i++){
            this.selectedContactIdList.push(selectedContactRows[i].Id);
            // const recordInput=this.selectedContactIdList.split(',').get(1);
            // console.log('recordInput====>>>>'+this.recordInput);
        }
         console.log('=>>>>>>'+this.selectedContactIdList);
    }
    handleSortContactData(event){
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortContactData(this.sortBy, this.sortDirection);
    }
    sortContactData(fieldName, direction) {
        
        let parseData = JSON.parse(JSON.stringify(this.tableData));
        // Return the value stored in the field
        let keyValue = (b) => {
            return b[fieldName];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.tableData = parseData;

    }
    cloneRecordsHandler(){
        cloneAnySobject({recordId: this.recordId,conObj:this.selectedContactIdList})
        .then(result => {
         this.accountId=result.Id;   
            this.template.querySelector('lightning-datatable').selectedContactRows=[];
           this.startToast();
        //    this.navigateToViewAccountPage(result);
           this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.accountId,
                objectApiName: 'Account',
                actionName: 'view'
            },
        });
         })
         .catch(error => {
            this.startToast('An Error occured during cloning'+error);
         });
    }
// Navigate to View Account Page
navigateToViewAccountPage() {
    
}
    startToast(){
        const event = new ShowToastEvent({
            title: 'Cloned Success',
            message: 'Clone sucessful',
            variant: 'success',
            mode: 'dismissable'
        });
        
        this.dispatchEvent(event);
    }

   
     
}