import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FetchHolidays from '@salesforce/apex/HolidayCmpController.FetchHolidays';
import AddNewHoliday from '@salesforce/apex/HolidayCmpController.AddNewHoliday';
import DeleteHolidays from '@salesforce/apex/HolidayCmpController.DeleteHolidays';
import getSpecificHolidays from '@salesforce/apex/HolidayCmpController.getSpecificHolidays';
import getUpcommingHolidays from '@salesforce/apex/HolidayCmpController.getUpcommingHolidays';
import { getRecord } from 'lightning/uiRecordApi';
import USER_PARENT_ROLE from '@salesforce/schema/User.UserRole.ParentRoleId';
import UserId from '@salesforce/user/Id';
export default class FullCalendarJs extends LightningElement {
    @track calenderDates=[];//i put the calendar dates in this variable and i used it in the front end//
    @track date = new Date();//gets the current date//
    @track year=this.date.getFullYear(); //gets the current year//
    @track month=this.date.getMonth(); //gets the current month (index based, 0-11)//
    @track currentDate;//This variable contains the current (date + month) and is used in the calendar header//
    @track holidayIds;//this variable contains selected holiday Ids//
    @track openEditModal = false; //this variable to open edit modal//
    @track openSpinner = false; //To open the spinner in waiting screens//
    @track holidaysCards=[]//this variable held the data insde the  section under calendar//
    @track holidays = {}; //all calendar holidays are stored in this array//
    @track title;//This variable contains the Name of holiday//
    @track startDate;//This variable contains the startDate of holiday//
    @track isAdmin=false;//if the user is an admin, this variable is used to show add, update, and delete; else, remove it.//
    @track openAddModal=false;//this variable To open add modal//
    @track numberDays=1;//this variable is the number of dates that were chosen.If there isn't a number by default=1//
    @track showAllHolidays=false;//this variable to display the holidays section under the calendar//
    @track showDateInAddModal;//This variable is used to display the selected date in the date input inside the holidays modal.//
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
    @wire(getRecord, {recordId: UserId, fields: [USER_PARENT_ROLE]}) 
    currentUserInfo({error, data}) {
        if (data) {
            let parentRoleId=data.fields.UserRole.value.fields.ParentRoleId.value
            //Check to see if the user is an admin (no one above him).//
            if(parentRoleId==null){
                this.isAdmin=true
            }
        } else if (error) {
            this.error = error ;
        }
    }
    connectedCallback() {
        try {
            this.loadDataFromDB();
        } catch (error) {
            console.log('error ',error)
        }
    }
    //Grouping the elements of 'result' by name.
    //curr: is the current element of the array during each iteration.
    //acc: represents the accumulator that stores the partial results when processing the array.
    groupData(dataArray) {
        let groupedObject = dataArray.reduce((acc, curr) => {
            let name = curr.Name;
            if (!acc[name]) {
                acc[name] = {
                    ids: [curr.Id],
                    title: curr.Name,
                    start: curr.ActivityDate,
                    end: curr.ActivityDate
                };
            } else {
                if (curr.ActivityDate < acc[name].start) {
                    acc[name].start = curr.ActivityDate;
                }
                if (curr.ActivityDate > acc[name].end) {
                    acc[name].end = curr.ActivityDate;
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
                    if(!this.holidays.hasOwnProperty(res[i].ActivityDate))this.holidays[res[i].ActivityDate]=[]
                    this.holidays[res[i].ActivityDate].push(res[i]);
                }
                if(this.startDate!=undefined)this.handleGetSpecificHoliday(this.startDate)
                this.calenderDates=[];
                this.openSpinner = true;
                setTimeout(() => {
                    // 
                    this.handleCalender();
                  }, 40);  
                
            })
    }
    //get upcoming holidays from today to next year//
    handleUpcommingHolidays(){
        getUpcommingHolidays()
        .then(result => {
            this.showAllHolidays=true
            this.holidayText='Upcomming';
            this.holidaysCards=this.groupData(JSON.parse(result))
            if(this.holidaysCards.length==0){
                this.noHolidays=true;
            }else{
                this.noHolidays=false;
            }
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
        this.currentDate=`${this.months[this.month]} ${this.year}`
    }
    //function to create a calendar with every pin//
    handleBuildDynamicCalender(day,month,date,monthStatus){
    //Adding a class if the key already exists in the array For all Holidays//
        let holidayClass='';
        let inactive='';
        let holidayDots=[];
        //Adding a class if the key already exists in the array For all Holidays//
        if(this.holidays[date]!=undefined){
            holidayClass='holiday'; 
            //loop to get every holiday for every day//
            for (let i=0; i < this.holidays[date].length; i++) {
                let holidayDotsTop=i==1?(17-9):i==2?(17+9):17;
                holidayDots.push({
                    'class':'ov '+holidayClass,
                    'style':'width: 6px; height: 6px;border-radius:50px;top:30px;left:'+holidayDotsTop+'px'
                })
                this.holidayCounter++;
            }
        }
        //if the date is from next month or the previous month,Add an inactive class to it //
        if(monthStatus=='previous' || monthStatus=='next')inactive='inactive';
        //this variable holds the date of today//
        let isToday=day===this.date.getDate() && month===new Date().getMonth()+1 && this.year===new Date().getFullYear() ? "active": ""
        //this variable contain date like this(2023-04-03)//
        let fullDate=day<10 ? `${this.year}-${parseInt(month)<10?'0'+parseInt(month):parseInt(month)}-0${day}` : `${this.year}-${parseInt(month)<10?'0'+parseInt(month):parseInt(month)}-${day}`
        //Add the active-day class to the selected date (the circle with the blue border and opacity background).//
        let saveselectedDate=this.startDate==fullDate?'active-day': ''; 
        this.calenderDates.push({
            'nb':day,
            'parentClasses':isToday +' ov cw circle-cal parent-circle' + inactive +' '+saveselectedDate,
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
            this.startDate=undefined
            this.showAllHolidays=false
            // Check if the icon is "calendar-prev" or "calendar-next"
            this.month=id==="calendar-prev" ? this.month - 1 : this.month + 1;
        }else{
            this.month=new Date(this.startDate).getMonth()
            this.year=new Date(this.startDate).getFullYear()
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
        let activeEl = event.target.parentElement.firstElementChild.classList
        /*add active-day(the circle with the blue border and opacity background) to the selected date 
        #If I choose the same date again, the active-day will be deactivated.
        #If I choose another day, the selected previews will be deactivated and the current date will be active.*/
        if(activeEl.contains('active-day')){
            activeEl.remove('active-day')
            this.showAllHolidays=false
            this.startDate=''
        }else{
            this.handleRemoveActiveDays()
            activeEl.add('active-day')
            this.startDate=event.target.dataset.full;
        }
        if(this.startDate!='')this.handleGetSpecificHoliday(event.target.dataset.full)
    }
    // get specific holiday info after i click on specific day//
    handleGetSpecificHoliday(holidayDate){
        setTimeout(() => {
            this.openSpinner = true;
          }, 40);  
        this.holidayText=new Date(holidayDate).toLocaleString('default', { month: 'long' })+' '+new Date(holidayDate).getDate()+', '+new Date(holidayDate).getFullYear();
        getSpecificHolidays({ 'holidayDate': holidayDate })
        .then(result => {
            this.holidaysCards=this.groupData(JSON.parse(result))
            this.showAllHolidays=true
            if(this.holidaysCards.length==0){
                this.noHolidays=true;
            }else{
                this.noHolidays=false;
            }
            //To close spinner and modal
            this.openSpinner = false;
        })
        .catch(error => {
          console.log('error ',error)
            // this.openSpinner = false;
        }) 
    }


//insert new holiday in the  data base//
    handleSaveHoliday(){
        //notify if the quantity of days is less than 1.//
        if (this.numberDays<=0) {
            this.showNotification('Oops', 'The Number of Days must be bigger that 1!', 'error');
            this.openSpinner = false;
            return;
        }
        let AllDays=this.handleGetDaysBetweenTwoDates(new Date(this.startDate));
        let newHoliday=[]
        AllDays.forEach((day) => {
            newHoliday.push({
                'Name' :this.title,
                'ActivityDate':day,
                'IsAllDay' : true
            })
          });
        //   this.openSpinner = true;
        //create new holiday in apex//
        AddNewHoliday({ 'newHoliday': JSON.stringify(newHoliday) })
            .then(result => {
                this.openAddModal=false;
                this.loadDataFromDB();
                this.showDateInAddModal='';
                this.handleChangeMonth();
            //   this.openSpinner = false;
            })
            .catch(error => {
            console.log('error ',error)
                this.openSpinner = false;
            })  
    }
    handleOpenModalAddHoliday(){
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
    //remove class active-day(the circle with the blue border and opacity background) from all element//
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
        this.startDate = event.target.dataset.start;
        this.openEditModal = true;
    }
    //function to update specific holiday holiday//
    handleUpdateHoliday(){
        //notify if the quantity of days is less than 1.//
        if (this.numberDays<=0) {
            this.showNotification('Oops', 'The Number of Days must be bigger that 1!', 'error');
            this.openSpinner = false;
            return;
        }
        this.removeHoliday()  
        this.handleSaveHoliday()   
    }
    //remove specific holiday//
    removeHoliday(event) {
        //show the spinner
        // this.openSpinner = true;
        const holidayIds =event!=undefined? event.target.value : this.holidayIds.split(',');
        DeleteHolidays({ 'holidayIds': holidayIds })
            .then(() => {
                this.openEditModal = false;
                this.loadDataFromDB();
                this.handleChangeMonth();
                // this.openSpinner = false;
            })
            .catch(error => {
                console.log('delete error ',error)
                this.openSpinner = false;
            });
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
    //end Calendar Code//

}