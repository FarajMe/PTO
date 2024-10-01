public with sharing class HolidayCmpController {
    //get All Holidays from database//
    @AuraEnabled
    public static String FetchHolidays() {
        List<Holiday> HolidaysList=new List<Holiday>([SELECT Id, Name, ActivityDate,IsAllDay FROM Holiday ]);
        return JSON.serialize(HolidaysList);
    }
    //add new holiday to dataBase//
    @AuraEnabled
    public static String AddNewHoliday(String newHoliday){
        List<Holiday>  delegationMap = (List<Holiday>)JSON.deserialize(newHoliday, List<Holiday>.class);
        for(Holiday record: delegationMap){
            insert record;
        }
        return 'success';
    }
    //delete specific holidays from dataBase//
    @AuraEnabled
    public static void DeleteHolidays(List<Id> holidayIds) {
        if (!holidayIds.isEmpty()) {
            delete [SELECT Id FROM Holiday WHERE Id IN :holidayIds];
        }
    }
    //get particular holidays on particular days.//
    @AuraEnabled
    public static String getSpecificHolidays(Date holidayDate) {
        List<Holiday> HolidaysListName=new List<Holiday>([SELECT Name FROM Holiday WHERE ActivityDate=:holidayDate]);
        List<String> holidaysInfo=new List<String>();
        for (Holiday holiday : HolidaysListName) {
            holidaysInfo.add(holiday.Name);
        }
        List<Holiday> HolidaysListInfo=new List<Holiday>([SELECT Id, Name, ActivityDate,IsAllDay  FROM Holiday WHERE Name IN :holidaysInfo]);
        return JSON.serialize(HolidaysListInfo);
    }
    //gel all upcomming holidays//
    @AuraEnabled
    public static String getUpcommingHolidays() {
        List<Holiday> UpcommingHolidaysList=new List<Holiday>([SELECT Id, Name, ActivityDate,IsAllDay FROM Holiday WHERE ActivityDate >= :System.today() ORDER BY ActivityDate]);
        return JSON.serialize(UpcommingHolidaysList);
    }

}