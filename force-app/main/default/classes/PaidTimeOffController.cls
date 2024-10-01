public with sharing class PaidTimeOffController {
   

    //retrieve holiday info and send JSON
    @AuraEnabled
    public static String FetchHolidays() {
        List<Paid_Time_off__c> HolidaysList=new List<Paid_Time_off__c>([SELECT Id, Name, Off_day__c,IsAllDay__c,RecordTypeId
         FROM Paid_Time_off__c ]);
        return JSON.serialize(HolidaysList);
    }


// add a new holiday
    // @AuraEnabled
    // public static String AddNewHoliday(String newHoliday) {
    //     List<Paid_Time_off__c> delegationMap = (List<Paid_Time_off__c>)JSON.deserialize(newHoliday, List<Paid_Time_off__c>.class);
        
    //     Date lastDate = null;
    //     Boolean hasSunday = false;
    //     String holidayName = '';
    //      Id recordTypeId = null;
    //     String reason = '';
    //     Integer counter=0;
    
    //     if (!delegationMap.isEmpty()) {
    //         for (Paid_Time_off__c record : delegationMap) {
    //             counter++;
    //             Date holidayDate = record.Off_Day__c;
                
    //             if (String.isEmpty(holidayName)) {
    //                 holidayName = record.Name;
    //                 recordTypeId = record.RecordTypeId; // Capture RecordTypeId
    //                 reason = record.Reason__c; // Capture Reason__c
    //             }
    //             if (lastDate == null || holidayDate > lastDate) {
    //                 lastDate = holidayDate;
    //             }
    //             DateTime holidayDateTime = DateTime.newInstance(holidayDate, Time.newInstance(0, 0, 0, 0));
    //             if (holidayDateTime.format('u') == '7') { // Sunday
    //                 hasSunday = true;
    
    //             }
    //         }
    //         if (lastDate != null && hasSunday) {
    //             Paid_Time_off__c extraRecord = new Paid_Time_off__c(
    //                 Name = holidayName,
    //                 Off_Day__c = lastDate.addDays(1),
    //                 IsAllDay__c = true,
    //                 RecordTypeId = recordTypeId, // Set RecordTypeId
    //                 Reason__c = reason // Set Reason__c
    //             );
    //             delegationMap.add(extraRecord);
    //         }
    //     }
    //     insert delegationMap;
    
    //     return 'success';
    // }
    @AuraEnabled
public static String AddNewHoliday(String newHoliday) {
    List<Paid_Time_off__c> delegationMap = (List<Paid_Time_off__c>)JSON.deserialize(newHoliday, List<Paid_Time_off__c>.class);
    
    Date lastDate = null;
    Boolean hasSunday = false;
    String holidayName = '';
    Id recordTypeId = null;
    String reason = '';
    Integer counter = 0;

    // Create a new list to store records that are not Sundays
    List<Paid_Time_off__c> filteredDelegationMap = new List<Paid_Time_off__c>();

    if (!delegationMap.isEmpty()) {
        for (Paid_Time_off__c record : delegationMap) {
            counter++;
            Date holidayDate = record.Off_Day__c;
            DateTime holidayDateTime = DateTime.newInstance(holidayDate, Time.newInstance(0, 0, 0, 0));

            // Skip the record if it's a Sunday (Sunday is represented by 7 in DateTime.format('u'))
            if (holidayDateTime.format('u') == '7') {
                hasSunday = true; // Flag that there was a Sunday
                continue; // Skip this record
            }

            // Add the non-Sunday record to the filtered list
            filteredDelegationMap.add(record);

            if (String.isEmpty(holidayName)) {
                holidayName = record.Name;
                recordTypeId = record.RecordTypeId; // Capture RecordTypeId
                reason = record.Reason__c; // Capture Reason__c
            }
            if (lastDate == null || holidayDate > lastDate) {
                lastDate = holidayDate;
            }
        }

        // Check if there was any Sunday and add an extra record if necessary
        if (lastDate != null && hasSunday) {
            Paid_Time_off__c extraRecord = new Paid_Time_off__c(
                Name = holidayName,
                Off_Day__c = lastDate.addDays(1),
                IsAllDay__c = true,
                RecordTypeId = recordTypeId // Set RecordTypeId
            );
            filteredDelegationMap.add(extraRecord);
        }
    }

    // Insert the filtered list (without Sundays)
    insert filteredDelegationMap;

    return 'success';
}



    //update  holiday//
    @AuraEnabled
    public static String UpdateHoliday(String newHoliday){
        List<Paid_Time_off__c> delegationMap = (List<Paid_Time_off__c>)JSON.deserialize(newHoliday, List<Paid_Time_off__c>.class);
        
        Date lastDate = null;        
        Boolean hasSunday = false;
        String holidayName = '';
    
        if (!delegationMap.isEmpty()) {
            for (Paid_Time_off__c record : delegationMap) {
                Date holidayDate = record.Off_Day__c;
                
               
                if (String.isEmpty(holidayName)) {
                    holidayName = record.Name; 
                }
                
                if (lastDate == null || holidayDate > lastDate) {
                    lastDate = holidayDate;
                }
                //In  Apex, the 'u' format specifier in the DateTime.format()
                //method is used to get the numeric representation of the day of the week.
                DateTime holidayDateTime = DateTime.newInstance(holidayDate, Time.newInstance(0, 0, 0, 0));
                if (holidayDateTime.format('u') == '7') {
                    hasSunday = true;
                    continue; // Skip this record

                }
            }
            
            if (lastDate != null && hasSunday) {
                String newName = holidayName;
                
                Paid_Time_off__c extraRecord = new Paid_Time_off__c(
                    Name = newName,
                    Off_Day__c = lastDate.addDays(1),
                    IsAllDay__c = true
                );
                delegationMap.add(extraRecord);
            }
        }
    
        insert delegationMap;
        
        return 'success';
    }

    

// do not use results in too many queries
@AuraEnabled(cacheable=true)
    public static String getRecordTypeNameById(Id recordTypeId) {
        // Query to get the RecordType name based on the recordTypeId
        RecordType rt = [SELECT Name FROM RecordType WHERE Id = :recordTypeId LIMIT 1];
        return rt.Name;
    }



    //delete specific holidays from dataBase//
    @AuraEnabled
    public static void DeleteHolidays(List<Id> holidayIds) {
        if (!holidayIds.isEmpty()) {
            delete [SELECT Id FROM Paid_Time_off__c WHERE Id IN :holidayIds ];
        }
    }
    //get particular holidays on particular days.//
    @AuraEnabled
    public static String getSpecificHolidays(Date holidayDate) {
        List<Paid_Time_off__c> HolidaysListName=new List<Paid_Time_off__c>([SELECT Name FROM Paid_Time_off__c WHERE Off_Day__c=:holidayDate]);
        List<String> holidaysInfo=new List<String>();
        for (Paid_Time_Off__c holiday : HolidaysListName) {
            holidaysInfo.add(holiday.Name);
        }
        List<Paid_Time_Off__c> HolidaysListInfo=new List<Paid_Time_Off__c>([SELECT Id, Name, Off_Day__C,IsAllDay__c,RecordTypeId  FROM Paid_Time_Off__c WHERE Name IN :holidaysInfo]);
        return JSON.serialize(HolidaysListInfo);
    }
    //gel all upcomming holidays//
    @AuraEnabled
    public static String getUpcommingHolidays() {
        List<Paid_Time_Off__c> UpcommingHolidaysList=new List<Paid_Time_Off__c>([SELECT Id, Name,Off_Day__c,IsAllDay__c,RecordTypeId FROM Paid_Time_Off__c WHERE Off_Day__c >= :System.today() ORDER BY Off_Day__c]);
        return JSON.serialize(UpcommingHolidaysList);
    }

}