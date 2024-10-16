import { LightningElement, track, wire,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import FetchHolidays from '@salesforce/apex/PaidTimeOffController.FetchHolidays';
import AddNewHoliday from '@salesforce/apex/PaidTimeOffController.AddNewHoliday';
import DeleteHolidays from '@salesforce/apex/PaidTimeOffController.DeleteHolidays';
import getSpecificHolidays from '@salesforce/apex/PaidTimeOffController.getSpecificHolidays';
import getUpcommingHolidays from '@salesforce/apex/PaidTimeOffController.getUpcommingHolidays';
import getRecordTypeNameById from '@salesforce/apex/PaidTimeOffController.getRecordTypeNameById';
import UpdateHoliday from '@salesforce/apex/PaidTimeOffController.UpdateHoliday';
import NoHolidaysImage from '@salesforce/resourceUrl/NoHolidaysImage';
import AddHoliday from '@salesforce/resourceUrl/AddHoliday';
import JolieCss from "@salesforce/resourceUrl/JolieCss";
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import PAID_TIME_OFF_OBJECT from '@salesforce/schema/Paid_Time_Off__c'; 


// import { getRecord } from 'lightning/uiRecordApi';
// import USER_PARENT_ROLE from '@salesforce/schema/User.UserRole.ParentRoleId';
// import UserId from '@salesforce/user/Id';
/*labels*/

// import LBL_Paid_Time_Off from "@salesforce/label/c.LBL_PaidTimeOff";
import LBL_Saved_Holiday from "@salesforce/label/c.LBL_Saved_Holiday";
import LBL_Cancel_Holiday from "@salesforce/label/c.LBL_Cancel_Holiday";
import LBL_Holidays from "@salesforce/label/c.LBL_Holidays";
import LBL_Title_Holiday from "@salesforce/label/c.LBL_Title_Holiday";
import LBL_Start_Date_Holiday from "@salesforce/label/c.LBL_Start_Date_Holiday";
import LBL_Number_Of_Days_Holiday from "@salesforce/label/c.LBL_Number_Of_Days_Holiday";
import LBL_Add_Holiday from "@salesforce/label/c.LBL_Add_Holiday";
import LBL_Upcomming_Holidays from "@salesforce/label/c.LBL_Upcomming_Holidays";
import LBL_Update_Holiday from "@salesforce/label/c.LBL_Update_Holiday";
import LBL_No_Holidays from "@salesforce/label/c.LBL_No_Holidays";
import LBL_Update_Holiday_Title from "@salesforce/label/c.LBL_Update_Holiday_Title";
import LBL_edit_Holiday from "@salesforce/label/c.LBL_edit_Holiday";
import LBL_Delete_Holiday from "@salesforce/label/c.LBL_Delete_Holiday";
import LBL_Add_Holiday_Text from "@salesforce/label/c.LBL_Add_Holiday_Text";
import LBL_Sun_Holiday from "@salesforce/label/c.LBL_Sun_Holiday";
import LBL_Mon_Holiday from "@salesforce/label/c.LBL_Mon_Holiday";
import LBL_Tue_Holiday from "@salesforce/label/c.LBL_Tue_Holiday";
import LBL_Wed_Holiday from "@salesforce/label/c.LBL_Wed_Holiday";
import LBL_Thu_Holiday from "@salesforce/label/c.LBL_Thu_Holiday";
import LBL_Fri_Holiday from "@salesforce/label/c.LBL_Fri_Holiday";
import LBL_Sat_Holiday from "@salesforce/label/c.LBL_Sat_Holiday";
/*labels*/

export default class PaidTimeOffCmp extends LightningElement {
@track calenderDates=[];//i put the calendar dates in this variable and i used it in the front end//
@track date = new Date();//gets the current date//
@track year=this.date.getFullYear(); //gets the current year//
@track month=this.date.getMonth(); //gets the current month (index based, 0-11)//
@track currentDate;//This variable contains the current (date + month) and is used in the calendar header//
@track holidayIds;//this variable contains  holiday Ids//
@track openEditModal = false; //this variable to open edit modal//
@track openSpinner = false; //To open the spinner in waiting screens//
@track holidaysCards=[]//this variable held the data insde the  section under calendar//
@track holidays = {}; //all calendar holidays are stored in this array//
@track title;//This variable contains the Name of holiday//
@track startDate;//This variable contains the startDate of holiday//
@api isAdmin=false;//if the user is an admin, this variable is used to show add, update, and delete; else, remove it.//
@api showUpcommingHolidays=false;
@track openAddModal=false;//this variable To open add modal//
@track numberDays=1;//this variable is the number of dates that were chosen.If there isn't a number by default=1//
@track showAllHolidays=false;//this variable to display the holidays section under the calendar//
@track showDateInAddModal;//This variable is used to display the selected date in the date input inside the holidays modal.//
@track imageUrlNoHolidays=`background-image:url('${NoHolidaysImage}')`;
@track imageUrlAddHolidays=`background-image:url('${AddHoliday}')`;
@track upHolidays=false;
@track addHolidayIcon=false
@track labels={
    // LBL_Paid_Time_Off,
    LBL_Saved_Holiday,
    LBL_Cancel_Holiday,
    LBL_Holidays,
    LBL_Title_Holiday,
    LBL_Start_Date_Holiday,
    LBL_Number_Of_Days_Holiday,
    LBL_Add_Holiday,
    LBL_Upcomming_Holidays,
    LBL_Update_Holiday,
    LBL_No_Holidays,
    LBL_Update_Holiday_Title,
    LBL_edit_Holiday,
    LBL_Delete_Holiday,
    LBL_Add_Holiday_Text,
    LBL_Sun_Holiday,
    LBL_Mon_Holiday,
    LBL_Tue_Holiday,
    LBL_Wed_Holiday,
    LBL_Thu_Holiday,
    LBL_Fri_Holiday,
    LBL_Sat_Holiday
};
months=[
"January",
"February",
"March",
"April",
"May",
"June",
"July",
"August",
"September",
"October",
"November",
"December"]; // array of month names//
// @wire(getRecord, {recordId: UserId, fields: [USER_PARENT_ROLE]}) 
// currentUserInfo({error, data}) {
//     if (data) {
//         let parentRoleId=data.fields.UserRole.value.fields.ParentRoleId.value
//         //Check to see if the user is an admin (no one above him).//
//         if(parentRoleId==null){
//             this.isAdmin=true
//         }
//     } else if (error) {
//         this.error = error ;
//     }
// }
renderedCallback() {
    Promise.all([
        loadStyle( this, JolieCss )
        ]).then(() => {
            console.log( 'Files loaded' );
        })
        .catch(error => {
            console.log( error.body.message );
    });
}

connectedCallback() {
    try {
        this.loadDataFromDB();
    } catch (error) {
        console.log('error ',error)
    }
}

@track recordTypeOptions = []; // Options for Record Types
@track picklistValues = []; // Options for Picklist Field
@track selectedRecordTypeId = ''; // Selected Record Type ID
@track selectedPicklistValue = ''; // Selected Picklist Value

objectApiName = PAID_TIME_OFF_OBJECT;

@api recordTypeId;
@api recordTypeName;

@wire(getRecordTypeNameById, { recordTypeId: '$recordTypeId' })
wiredRecordTypeName({ error, data }) {
    if (data) {
        this.recordTypeName = data;
    } else if (error) {
        console.error('Error retrieving Record Type name:', error);
    }
}

// @wire(getObjectInfo, { objectApiName: PAID_TIME_OFF_OBJECT })
// objectInfo({ error, data }) {
//     if (data) {
//         this.recordTypeOptions = Object.keys(data.recordTypeInfos)
//         // filter out "Master"
//             .filter(rtId => !data.recordTypeInfos[rtId].master) 
//             .map(rtId => ({
//                 label: data.recordTypeInfos[rtId].name,
//                 value: rtId
//             }));
//     } else if (error) {
//         console.error('Error retrieving object info:', error);
//     }
// }

@wire(getObjectInfo, { objectApiName: PAID_TIME_OFF_OBJECT })
objectInfo({ error, data }) {
    if (data) {
        this.recordTypeOptions = Object.keys(data.recordTypeInfos)
            .filter(rtId => !data.recordTypeInfos[rtId].master) // Exclude the master record type
            .map(rtId => ({
                label: data.recordTypeInfos[rtId].name, // Get the label for the record type
                value: rtId  // Store the record type ID
            }));

        // Optionally, store the ID of the 'Weekend' record type for later use
        this.weekendRecordTypeId = this.recordTypeOptions.find(option => option.label === 'Weekend').value;
    } else if (error) {
        console.error('Error retrieving record types:', error);
    }
}


@track recordTypeOptions = [{ value: '012J70000008UMKIA2', label: 'Holiday' },
                            { value: '012J70000008UMPIA2', label: 'Weekend' },
                            { value: '012J70000008UMUIA2', label: 'Vacation' },
                            { value: '012J70000008UMZIA2', label: 'Sick' },
                            { value: '012J70000008UMeIAM', label: 'Parental' }];


// Retrieve picklist values based on the selected record type
@wire(getPicklistValuesByRecordType, {
    objectApiName: PAID_TIME_OFF_OBJECT,
    recordTypeId: '$selectedRecordTypeId'
})

wiredPicklistValues({ error, data }) {
    if (data) {
        this.picklistValues = data.picklistFieldValues['RecordTypeId'] ? data.picklistFieldValues['RecordTypeId'].values : []; // Adjust field API name if needed
    } else if (error) {
        console.error('Error retrieving picklist values:', error);
    }
}

// Handle record type selection
handleRecordTypeChange(event) {
    this.selectedRecordTypeId = event.detail.value;
}

// Handle picklist value selection
handlePicklistValueChange(event) {
    this.selectedPicklistValue = event.detail.value;
    // console.log('wisspicklist'+ selectedPicklistValue);
}

// handleRecordType(recordTypeId) {
//     let result;
//     switch (recordTypeId) {
//         case '012J70000008UMKIA2':
//             result = 'Holiday';
//             break;
//         case '012J70000008UMPIA2':
//             result = 'Weekend';
//             break;
//         case '012J70000008UMUIA2':
//             result = 'Vacation';
//             break;
//         case '012J70000008UMZIA2':
//             result = 'Sick';
//             break;
//         case '012J70000008UMeIAM':
//             result = 'Parental';
//             break;
//         default:
//             result = 'Unknown Record Type';
//             break;
//     }
//     return result;
// }

recordTypeMap = new Map(this.recordTypeOptions.map(rt => [rt.value, rt.label]));


//Grouping the elements of 'result' by name.
//curr: is the current element of the array during each iteration.
//acc: represents the accumulator that stores the partial results when processing the array.
groupData(dataArray) {
    let groupedObject = dataArray.reduce((acc, curr) => {

        let name = curr.Name;
        // let recname = this.handleRecordType(curr.RecordTypeId);
        let recname = this.recordTypeMap.get(curr.RecordTypeId);

        if (!acc[name]) {
            acc[name] = {
                ids: [curr.Id],
                title: curr.Name,
                start:curr.Off_Day__c,
                end:curr.Off_Day__c,
                // start: new Date(curr.Off_Day__c).toLocaleString('default', { month: 'long' })+' '+new Date(curr.Off_Day__c).getDate()+', '+new Date(curr.Off_Day__c).getFullYear(),
                // end: new Date(curr.Off_Day__c).toLocaleString('default', { month: 'long' })+' '+new Date(curr.Off_Day__c).getDate()+', '+new Date(curr.Off_Day__c).getFullYear(),
                fullDate:curr.Off_Day__c,
                recordid:curr.RecordTypeId,
                recordtitle:recname,
            };
        } else {
            if (curr.Off_Day__c < acc[name].start) {
                acc[name].start=curr.Off_Day__c
                // acc[name].start = new Date(curr.Off_Day__c).toLocaleString('default', { month: 'long' })+' '+new Date(curr.Off_Day__c).getDate()+', '+new Date(curr.Off_Day__c).getFullYear();
            }
            if (curr.Off_Day__c > acc[name].end) {
                acc[name].end=curr.Off_Day__c
                // acc[name].end = new Date(curr.Off_Day__c).toLocaleString('default', { month: 'long' })+' '+new Date(curr.Off_Day__c).getDate()+', '+new Date(curr.Off_Day__c).getFullYear();
            }
            acc[name].ids.push(curr.Id);
        }
        return acc;
    }, {});
    let groupedArray = Object.values(groupedObject);
    return groupedArray;
}
//get all holidays from data base//
loadDataFromDB() {
    FetchHolidays()
        .then(result => {
            let res=JSON.parse(result)
            this.holidays={};
            this.numberDays=1;
            //convert res(result) to array of keys//
            for (let i = 0; i < res.length; i++) {
                if(!this.holidays.hasOwnProperty(res[i].Off_Day__c))this.holidays[res[i].Off_Day__c]=[]
                this.holidays[res[i].Off_Day__c].push(res[i]);
            }
            if(this.startDate!=undefined)this.handleGetSpecificHoliday(this.startDate)
            this.calenderDates=[];
            this.openSpinner = true;
            setTimeout(() => {
                this.handleCalender();
                // console.log('wiss ' + JSON.stringify(this.holidays));
                // console.log('wiss' + recordTypeName['012J70000008UMZIA2']);     
            }, 40);  
            
        })
}
//get upcoming holidays from today to next year//
handleUpcommingHolidays(){
    getUpcommingHolidays()
    .then(result => {
        //this.selectedDate=false;
        this.upHolidays=true
        this.holidaysCards=[];
        this.showAllHolidays=true;
        this.addHolidayIcon=false;
        this.holidayText=this.labels.LBL_Upcomming_Holidays;
        this.handleRemoveActiveDays();
        this.holidaysCards=this.groupData(JSON.parse(result))
        if(this.holidaysCards.length==0){
            this.noHolidays=true;
        }else{
            this.noHolidays=false;
        }
        this.handleAddScroll(this.holidaysCards);
    })
}

//on change get inputs value
handleGetInputsValues(event){
    let inputName=event.target.name;
    let inputValue=event.target.value
    this[inputName] = inputValue;
    this.handleRemoveActiveDays()
}

//To close the edit Modal
handleCancelEditing() {
    this.openEditModal = false;
}

// method to show toast//
showNotification(title, message, variant) {
    const evt = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant,
    });
    this.dispatchEvent(evt);
}

//Calendar Code//
handleCalender(){
    this.calenderDates=[]
    this.weekendCounter=0
    // this.holidayCounter=0 this code later for holidays
    // get the first day of the month//
    let dayone=new Date(this.year, this.month, 1).getDay();
    // get the last date of the month//
    let lastdate=new Date(this.year, this.month + 1, 0).getDate();
    // get the day of the last date of the month//
    let dayend=new Date(this.year, this.month, lastdate).getDay();
    // get the last date of the previous month //
    let monthlastdate=new Date(this.year, this.month, 0).getDate();
    // loop to add the last dates of the previous month//
    for (let i=dayone; i > 0; i--) {
        let fullDay=(monthlastdate - i + 1)<10 ? `${this.year}-${parseInt(this.month)<10?'0'+parseInt(this.month):parseInt(this.month)}-0${(monthlastdate - i + 1)}` : `${this.year}-${parseInt(this.month)<10?'0'+parseInt(this.month):parseInt(this.month)}-${(monthlastdate - i + 1)}`;
        this.handleBuildDynamicCalender((monthlastdate - i + 1),this.month,fullDay,'previous')
    }
    // loop to add the dates of the current month//
    for (let i=1; i <=lastdate; i++) {
        let fullDay=i<10 ? `${this.year}-${parseInt(this.month+1)<10?'0'+parseInt(this.month+1):parseInt(this.month+1)}-0${i}` : `${this.year}-${parseInt(this.month+1)<10?'0'+parseInt(this.month+1):parseInt(this.month+1)}-${i}`;
        this.handleBuildDynamicCalender(i,(this.month+1),fullDay,'current')
    }
    // loop to add the first dates of the next month//
    for (let i=dayend; i < 6; i++) {
        let fullDay=(i - dayend + 1)<10 ? `${this.year}-${parseInt(this.month+2)<10?'0'+parseInt(this.month+2):parseInt(this.month+2)}-0${(i - dayend + 1)}` : `${this.year}-${parseInt(this.month+2)<10?'0'+parseInt(this.month+2):parseInt(this.month+2)}-${(i - dayend + 1)}`;
        this.handleBuildDynamicCalender((i - dayend + 1),(this.month+2),fullDay,'next')
    }
    // this.currentDate=`${this.months[this.month]} ${this.year}`
    this.currentDate=this.year+'-'+(parseInt(this.month+1)<10?'0'+parseInt(this.month+1):parseInt(this.month+1))+'-'+'01'
    console.log('this.currentDate ',this.currentDate)
}

//function to create a calendar with every pin
//function with duplicate dots
handleBuildDynamicCalender(day,month,date,monthStatus){
//Adding a class if the key already exists in the array For all Holidays//
let holidayClass = '';
let inactive = '';
let holidayDots = [];

//is 0
let sundays = new Date(this.year, month - 1, day).getDay();

//set for unique holidays
let processedHolidayNames = new Set();

// Adding a class if the key already exists in the array For all Holidays
if (this.holidays[date] != undefined) {
    holidayClass = 'holiday'; 

    // Loop to get every holiday for every day
    // sunday will fail but loop will be accessed eitherway for other days
    //sunday = 0 since .getday lal sunday returns 0
    if (sundays) {
        for (let i = 0; i < this.holidays[date].length; i++) {
            let holiday = this.holidays[date][i];
            let holidayName = holiday.Name;

            //add only if holidayname is not existant in the set
            if (!processedHolidayNames.has(holidayName)) {
                processedHolidayNames.add(holidayName);
                //add dot  to the array
                //edit position depending on nb of holidays
                //max 3 holidays dots
                let holidayDotsTop = i == 1 ? (17 - 9) : i == 2 ? (17 + 9) : 17;
                holidayDots.push({
                    'class': 'ov ' + holidayClass,
                    'style': 'width: 6px; height: 6px; border-radius: 50px; top: 30px; left: ' + holidayDotsTop + 'px'
                });
                this.holidayCounter++;
            }
        }
    }
}
    
    //if the date is from next month or the previous month,Add an inactive class to it //
    if(monthStatus=='previous' || monthStatus=='next')
        inactive='inactive';

    //adds inactive class to sundays
    // let sundays = new Date(this.year, month - 1, day).getDay();
if (sundays === 0) { // Sunday
    inactive += ' inactive';
    //inactive = 'inactive'
}
    //this variable holds the date of today//
    let isToday=day===this.date.getDate() && month===new Date().getMonth()+1 && this.year===new Date().getFullYear() ? "active": ""
    //this variable contain date like this(2023-04-03)//
    let fullDate=day<10 ? `${this.year}-${parseInt(month)<10?'0'+parseInt(month):parseInt(month)}-0${day}` : `${this.year}-${parseInt(month)<10?'0'+parseInt(month):parseInt(month)}-${day}`
    //Add the active-day class to the selected date (the box with the blue border and opacity background).//
    let saveselectedDate=this.startDate==fullDate ?'active-day': '';
    if(this.startDate==undefined && isToday=='active' && this.showAllHolidays==false){
        this.handleGetSpecificHoliday(fullDate)
    }
    this.calenderDates.push({

        'nb':day,
        'parentClasses':isToday +' ov cw circle-cal parent-circle ' + inactive +' '+saveselectedDate,
        'holidays':holidayDots,
        'full':fullDate,
    })  
    setTimeout(() => {
        this.openSpinner = false;
        }, 200); 
}



//function that modifies the calendar months//
handleChangeMonth(event) {

    if(event!=undefined){
        let id=event.target.dataset.id;
        this.startDate=undefined;
        this.showAllHolidays=false;
        this.addHolidayIcon=true;
        this.noHolidays=false
        // Check if the icon is "calendar-prev" or "calendar-next"
        this.month=id==="calendar-prev" ? this.month - 1 : this.month + 1;
    }else{
        this.month=new Date(this.startDate).getMonth();
        this.year=new Date(this.startDate).getFullYear();
    }
    // Check if the month is out of range
    if (this.month <0 || this.month > 11) {
        // Set the date to the first day of the month with the new year
        this.date=new Date(this.year, this.month, new Date().getDate());
        // Set the year to the new year
        this.year=this.date.getFullYear();
        // Set the month to the new month
        this.month=this.date.getMonth();
    }else {
        // Set the date to the current date
        this.date=new Date();
    } 
    this.loadDataFromDB()
}

//function to get holiday if exist or add holiday for a specific date in a calendar//
handleChangeDay(event){
    this.upHolidays=false
    let activeEl = event.target.parentElement.firstElementChild.classList
    /*add active-day(the box with the blue border and opacity background) to the selected date 
    #If I choose the same date again, the active-day will be deactivated.
    #If I choose another day, the selected previews will be deactivated and the current date will be active.*/
    if(!activeEl.contains('inactive')){
        if(activeEl.contains('active-day')){
            activeEl.remove('active-day')
            this.showAllHolidays=false
            this.startDate=''
            this.addHolidayIcon=true;
            this.noHolidays=false
        }else{
            this.handleRemoveActiveDays()
            activeEl.add('active-day')
            this.startDate=event.target.dataset.full;
        if(this.startDate!='')this.handleGetSpecificHoliday(event.target.dataset.full)
    }
}else{
    this.handleRemoveActiveDays()
    this.showAllHolidays=false,
    this.noHolidays=false
    this.addHolidayIcon=true;
}
}
// get specific holiday info after i click on specific day//
handleGetSpecificHoliday(holidayDate){
    setTimeout(() => {
        this.openSpinner = true;
        }, 40); 
        this.holidayText=holidayDate;
        console.log('test ',this.holidayText);

    // this.holidayText=new Date(holidayDate).toLocaleString('default', { month: 'long' })+' '+new Date(holidayDate).getDate()+', '+new Date(holidayDate).getFullYear();
    getSpecificHolidays({ 'holidayDate': holidayDate })
    .then(result => {
        this.holidaysCards=this.groupData(JSON.parse(result))
        this.showAllHolidays=true
        if(this.holidaysCards.length==0){
            this.noHolidays=true;
        }else{
            this.noHolidays=false;
        }
        this.addHolidayIcon=false;
        this.handleAddScroll(this.holidaysCards);
        //To close spinner and modal
        this.openSpinner = false;
    })
    .catch(error => {
        console.log('error ',error)
        // this.openSpinner = false;
    }) 
}


// handleSaveHoliday() {
//     if (!this.handleCheckInputsIfEmpty()) return;

//     // Notify if the quantity of days is less than 1.
//     if (this.numberDays <= 0) {
//         this.showNotification('Oops', 'The Number of Days must be equal or bigger than 1', 'error');
//         this.openSpinner = false;
//         return;
//     }

//     let AllDays = this.handleGetDaysBetweenTwoDates(new Date(this.startDate));
//     let newHoliday = [];

//     AllDays.forEach((day) => {
//         newHoliday.push({
//             'Name': this.title,
//             'Off_Day__c': day,
//             'IsAllDay__c': true,
//             'RecordTypeId': this.selectedRecordTypeId // Set selected RecordTypeId
//             // 'Reason__c': this.selectedPicklistValue // Set selected Reason__c (picklist value)
//         });
//     });
//     console.log('wiss' + JSON.stringify(newHoliday));
//     AddNewHoliday({ 'newHoliday': JSON.stringify(newHoliday) })
//         .then(result => {
//             this.openAddModal = false;
//             if (this.upHolidays == true) {
//                 this.handleUpcommingHolidays();
//                 this.startDate = undefined;
//             } else {
//                 this.handleChangeMonth();
//             }
//             this.loadDataFromDB();
//             this.showDateInAddModal = '';
//         })
//         .catch(error => {
//             console.log('error ', error);
//             this.openSpinner = false;
//         });
// }



// handleSaveHoliday() {
//     if (!this.handleCheckInputsIfEmpty()) return;

//     // Notify if the quantity of days is less than 1.
//     if (this.numberDays <= 0) {
//         this.showNotification('Oops', 'The Number of Days must be equal or bigger than 1', 'error');
//         this.openSpinner = false;
//         return;
//     }


//     let AllDays = this.handleGetDaysBetweenTwoDates(new Date(this.startDate));
//     let newHoliday = [];

//     AllDays.forEach((day) => {
//         let dayOfWeek = new Date(day).getDay(); // 0 = Sunday, 6 = Saturday

//         // Check if the type is 'weekend' and if the day is Saturday or Sunday.
//         if (this.selectedRecordTypeId === 'Weekend') { // Assuming 'Weekend' is the type identifier for weekend
//             if (dayOfWeek !== 0 && dayOfWeek !== 6) {
//                 this.showNotification('Error', 'Weekend holidays must be on Saturday or Sunday.', 'error');
//                 this.openSpinner = false;
//                 return;
//             }
//         }

//         // If the check passes, proceed to add the holiday.
//         newHoliday.push({
//             'Name': this.title,
//             'Off_Day__c': day,
//             'IsAllDay__c': true,
//             'RecordTypeId': this.selectedRecordTypeId // Set selected RecordTypeId
//             // 'Reason__c': this.selectedPicklistValue // Set selected Reason__c (picklist value)
//         });
//     });

//     // Proceed with saving the holiday records if the validation passes
//     if (newHoliday.length > 0) {
//         console.log('wiss' + JSON.stringify(newHoliday));
//         AddNewHoliday({ 'newHoliday': JSON.stringify(newHoliday) })
//             .then(result => {
//                 this.openAddModal = false;
//                 if (this.upHolidays == true) {
//                     this.handleUpcommingHolidays();
//                     this.startDate = undefined;
//                 } else {
//                     this.handleChangeMonth();
//                 }
//                 this.loadDataFromDB();
//                 this.showDateInAddModal = '';
//             })
//             .catch(error => {
//                 console.log('error ', error);
//                 this.openSpinner = false;
//             });
//     }
// }

handleSaveHoliday() {
    if (!this.handleCheckInputsIfEmpty()) return;

    // Notify if the quantity of days is less than 1.
    if (this.numberDays <= 0) {
        this.showNotification('Oops', 'The Number of Days must be equal or bigger than 1', 'error');
        this.openSpinner = false;
        return;
    }

    // Fetch existing holidays to check for name duplication
    FetchHolidays()
        .then(result => {
            let res = JSON.parse(result);
            let existingHolidayNames = res.map(holiday => holiday.Name);

            // Check if the new holiday name already exists
            if (existingHolidayNames.includes(this.title)) {
                this.showNotification('Oops', 'A holiday with the same name already exists!', 'error');
                this.openSpinner = false;
                return;
            }

            // Proceed if no duplicate holiday name exists
            let AllDays = this.handleGetDaysBetweenTwoDates(new Date(this.startDate));
            let newHoliday = [];

            AllDays.forEach((day) => {
                let dayOfWeek = new Date(day).getDay(); // 0 = Sunday, 6 = Saturday
                console.log('Day of Week:', dayOfWeek);

                // Check if the selected RecordTypeId is for 'Weekend' holidays
                if (this.selectedRecordTypeId === this.weekendRecordTypeId) {
                    // If it's a weekend holiday, ensure it's either Saturday (6) or Sunday (0)
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        this.showNotification('Oops', 'Weekend holidays must be on Saturday or Sunday.', 'error');
                        this.openSpinner = false;
                        return;
                    }
                }

                // Add new holiday record if the check passes
                newHoliday.push({
                    'Name': this.title,
                    'Off_Day__c': day,
                    'IsAllDay__c': true,
                    'RecordTypeId': this.selectedRecordTypeId
                });
            });

            // Proceed with saving the holiday records if the validation passes
            if (newHoliday.length > 0) {
                console.log('New Holiday: ' + JSON.stringify(newHoliday));
                AddNewHoliday({ 'newHoliday': JSON.stringify(newHoliday) })
                    .then(result => {
                        this.openAddModal = false;
                        if (this.upHolidays === true) {
                            this.handleUpcommingHolidays();
                            this.startDate = undefined;
                        } else {
                            this.handleChangeMonth();
                        }
                        this.loadDataFromDB();
                        this.showDateInAddModal = '';
                    })
                    .catch(error => {
                        console.error('Error adding holiday:', JSON.stringify(error));
                        this.openSpinner = false;
                    });
                    
            }
        })
        .catch(error => {
            console.log('Error fetching holidays: ', error);
            this.openSpinner = false;
        });
}






// updateOldHoliday(){

//     if(!this.handleCheckInputsIfEmpty())return;
//     //notify if the quantity of days is less than 1.//
//     if (this.numberDays<=0) {
//         this.showNotification('Oops', 'The Number of Days must be equal or bigger than 1', 'error');
//         this.openSpinner = false;
//         return;
//     }
//     let AllDays=this.handleGetDaysBetweenTwoDates(new Date(this.startDate));
// //    console.log('wiss test' + AllDays.getDay());

//     let newHoliday=[]
    
// AllDays.forEach((day) => {
//     newHoliday.push({
//         'Name': this.title,
//         'Off_Day__c': day,
//         'IsAllDay__c': true,
//         'RecordTypeId':this.selectedRecordTypeId,
//         // 'Reason__c':'Test'
//     });
    
// });

//     //   this.openSpinner = true;
//     //create new holiday in apex//
//     AddNewHoliday({ 'newHoliday': JSON.stringify(newHoliday) })
//         .then(result => {
//             this.openAddModal=false;
//             if(this.upHolidays==true){
//                 this.handleUpcommingHolidays();
//                 this.startDate=undefined
//             }else{
//                 this.handleChangeMonth();
//             }
//             this.loadDataFromDB();
//             this.showDateInAddModal='';
//         })
//         .catch(error => {
//         console.log('error ',error)
//             this.openSpinner = false;
//         })  

// }

updateOldHoliday() {
    // Check for empty inputs
    if (!this.handleCheckInputsIfEmpty()) return;

    // Notify if the quantity of days is less than 1
    if (this.numberDays <= 0) {
        this.showNotification('Oops', 'The Number of Days must be equal to or bigger than 1', 'error');
        this.openSpinner = false;
        return;
    }

    // Get the day of the week for the selected date
    const selectedDay = new Date(this.startDate); // Assuming `this.startDate` is your selected date
    const dayOfWeek = selectedDay.getDay(); // 0 = Sunday, 6 = Saturday

    // Check if the selected holiday type is 'Weekend'
    if (this.selectedRecordTypeId === this.weekendRecordTypeId) {
        // Validate that the selected day is either Saturday (6) or Sunday (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            this.showNotification('Oops', 'Weekend holidays must be on Saturday or Sunday.', 'error');
            this.openSpinner = false;
            return;
        }
    }else{

    // Prepare the new holiday object for submission
    let newHoliday = [];
    let allDays = this.handleGetDaysBetweenTwoDates(selectedDay); // Assuming this method returns an array of dates

    allDays.forEach((day) => {
        newHoliday.push({
            'Name': this.title, // Keep the name as it is (not editable)
            'Off_Day__c': day,
            'IsAllDay__c': true,
            'RecordTypeId': this.selectedRecordTypeId,
            // 'Reason__c': 'Test' // Uncomment if you need to add a reason
        });
    });

    // Create new holiday in Apex
    this.removeHoliday();
    AddNewHoliday({ 'newHoliday': JSON.stringify(newHoliday) })
        .then(result => {
            this.openAddModal = false; // Close modal on success
            this.loadDataFromDB(); // Reload the data
            this.showDateInAddModal = ''; // Reset any displayed dates
            // Handle upcoming holidays or month change if needed
            if (this.upHolidays) {
                this.handleUpcommingHolidays();
                this.startDate = undefined;
            } else {
                this.handleChangeMonth();
            }
        })
        .catch(error => {
            console.log('Error:', error);
            this.showNotification('Error', 'There was an issue updating the holiday.', 'error'); // Notify user of the error
            this.openSpinner = false; // Ensure spinner is turned off
        });
}
}

handleOpenModalAddHoliday(){
    this.upHolidays=false;
    this.openAddModal=true;
    const activeEl = this.template.querySelectorAll('.active-day');
    if(activeEl.length!=0){
        this.showDateInAddModal=this.startDate
    }else{
        this.showDateInAddModal=''
    }
}
//To close the edit Modal(new)
handleCloseModal() {
    this.openEditModal = false;
    this.openAddModal=false;
}
//remove class active-day(the box with the blue border and opacity background) from all element//
handleRemoveActiveDays(){
    let activeDays=this.template.querySelectorAll('.active-day')
    activeDays.forEach((day) => {
        day.classList.remove('active-day');
        });
}
//function to open edit modal//
handleOpenModalEditHoliday(event){
    this.holidayIds =event.target.dataset.key;
    this.title = event.target.dataset.title;
    this.startDate =event.target.dataset.start
    this.openEditModal = true;
}
//function to update specific holiday holiday//
handleUpdateHoliday(){
    if(!this.handleCheckInputsIfEmpty())return;
    //notify if the quantity of days is less than 1.//
    if (this.numberDays<=0) {
        this.showNotification('Oops', 'The Number of Days must be equal or bigger than 1', 'error');
        this.openSpinner = false;
        return;
    }
    this.selectedDate = undefined;
    this.removeHoliday()  
    // this.handleSaveHoliday()   
    this.updateOldHoliday()
}

// getSelectedDate() {
//     return this.startDate;
// }

//function used to delete holidays,
//different method for deleting a selected date
//and deleting from upcoming  holidays
removeHoliday(event) {
    // Show the spinner
    let holidayIds = event !== undefined ? event.target.value : this.holidayIds.split(',');
    const selectedDate = this.startDate;

    // if upcoming holidays section is open
    if (this.upHolidays === true) {
        // delete all holidays of the card
        DeleteHolidays({ 'holidayIds': holidayIds })
            .then(() => {
                this.openEditModal = false;
                this.handleUpcommingHolidays();
                this.startDate = undefined;
                this.loadDataFromDB();
            })
            .catch(error => {
                console.error('Delete error: ', error);
                this.openSpinner = false;
            });
    } 
    // if a specific date is selected
    else if (selectedDate !== undefined) {
        // get holidays for specific day
        getSpecificHolidays({ holidayDate: selectedDate })
            .then(result => {
                let holidays = JSON.parse(result);
                // find the index of the holiday where Off_Day__c matches the selected date
                let i = holidays.findIndex(holiday => holiday.Off_Day__c === selectedDate);

                if(i == 0){
                    DeleteHolidays({ 'holidayIds': holidayIds })
                     .then(() => {
                        this.openEditModal = false;
                        if(this.upHolidays==true){
                            this.handleUpcommingHolidays();
                            this.startDate=undefined
                        }else{
                            this.handleChangeMonth();
                            }
                        this.loadDataFromDB();
                        })
                        .catch(error => {
                          console.log('delete error ',error)
                          this.openSpinner = false;
                        });
                }else{
                if (i !== -1) {
                    DeleteHolidays({ 'holidayIds': [holidays[i].Id] })
                        .then(() => {
                            this.openEditModal = false;
                            this.handleChangeMonth();
                            this.loadDataFromDB();
                        })
                        .catch(error => {
                            console.error('Delete error: ', error);
                            this.openSpinner = false;
                        });
                } else {
                    console.log('No holiday found with the selected date.');
                    this.openSpinner = false;
                }}
                
            })
            .catch(error => {
                console.error('Error fetching holidays: ', error);
                this.openSpinner = false;
            });
    }
}





//function to calculate the number of days between a selected date and number of days(input)//
handleGetDaysBetweenTwoDates(start){

    let startDate=new Date(start)
    Date.prototype.addDays = function(days) {
        startDate.setDate(startDate.getDate() + parseInt(days));
        return startDate;
        };
    let endDate=new Date().addDays(this.numberDays-1);
    
    for(var arr=[],dt=new Date(start); dt<=new Date(endDate); dt.setDate(dt.getDate()+1)){
        let date=new Date(dt);
        let month=parseInt(date.getMonth()+1)<10 ? '0'+parseInt(date.getMonth()+1):parseInt(date.getMonth()+1);
        let day=date.getDate()<10 ? '0'+date.getDate():date.getDate();
        arr.push(date.getFullYear()+'-'+month+'-'+day);
    }
    return arr;
}

handleCheckInputsIfEmpty(){
    let inputValid = true;
    this.template.querySelectorAll('[data-inputgroup="AllInputs"]').forEach(element => {
        if (!element.reportValidity()) {
            inputValid = false;
        }
    });
    return inputValid;
}

handleAddScroll(holidaysArray){
    setTimeout(() => {
        if(holidaysArray.length>=3){
            this.template.querySelectorAll('.holidays-list')[0].classList.remove('no-scrollbars')
        }else{
            this.template.querySelectorAll('.holidays-list')[0].classList.add('no-scrollbars')
        }
    }, 40);
}
//end Calendar Code//
}