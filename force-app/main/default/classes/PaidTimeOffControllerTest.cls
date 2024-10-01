@isTest
public class PaidTimeOffControllerTest {

    // Test setup method to create test data
    @testSetup
    static void setup() {
        // Fetch the RecordType but ensure no `Id` field for Paid_Time_Off__c is set during insert
        RecordType rt = [SELECT Id FROM RecordType WHERE SObjectType = 'Paid_Time_Off__c' LIMIT 1];
        
        // Insert two test Paid_Time_Off__c records without specifying an `Id`
        List<Paid_Time_Off__c> testHolidays = new List<Paid_Time_Off__c>{
            new Paid_Time_Off__c(Name = 'Test Holiday 1', Off_Day__c = Date.today(), IsAllDay__c = true, RecordTypeId = rt.Id),
            new Paid_Time_Off__c(Name = 'Test Holiday 2', Off_Day__c = Date.today().addDays(1), IsAllDay__c = true, RecordTypeId = rt.Id)
        };
        insert testHolidays; // Ensure you're inserting without `Id`
    }

    // Test FetchHolidays method
    @isTest
    static void testFetchHolidays() {
        Test.startTest();
        String result = PaidTimeOffController.FetchHolidays();
        System.assertNotEquals(null, result, 'The result should not be null.');
        List<Paid_Time_Off__c> holidays = (List<Paid_Time_Off__c>) JSON.deserialize(result, List<Paid_Time_Off__c>.class);
        System.assertEquals(2, holidays.size(), 'There should be 2 holidays.');
        Test.stopTest();
    }

    // Test AddNewHoliday method
    @isTest
    static void testAddNewHoliday() {
        // Fetch the RecordType but ensure no `Id` is included
        RecordType rt = [SELECT Id FROM RecordType WHERE SObjectType = 'Paid_Time_Off__c' LIMIT 1];
        
        List<Paid_Time_Off__c> newHoliday = new List<Paid_Time_Off__c>{
            new Paid_Time_Off__c(Name = 'Holiday 3', Off_Day__c = Date.today().addDays(2), IsAllDay__c = true, RecordTypeId = rt.Id)
        };
        
        // Ensure that the serialized JSON does not contain an Id field
        String newHolidayJSON = JSON.serialize(newHoliday);

        Test.startTest();
        String result = PaidTimeOffController.AddNewHoliday(newHolidayJSON);
        System.assertEquals('success', result, 'The holiday should be added successfully.');
        Test.stopTest();
    }

    // Test UpdateHoliday method
    @isTest
    static void testUpdateHoliday() {
        // Fetch an existing holiday for update
        List<Paid_Time_Off__c> existingHolidays = [SELECT Id, Name, Off_Day__c FROM Paid_Time_Off__c LIMIT 1];
        
        if (!existingHolidays.isEmpty()) {
            Paid_Time_Off__c holidayToUpdate = existingHolidays[0];
            holidayToUpdate.Off_Day__c = Date.today().addDays(5);
            
            // Serialize the list including the Id for update
            String updatedHolidayJSON = JSON.serialize(new List<Paid_Time_Off__c>{holidayToUpdate});

            Test.startTest();
            String result = PaidTimeOffController.UpdateHoliday(updatedHolidayJSON); 
            System.assertEquals('success', result, 'The holiday should be updated successfully.');
            Test.stopTest();
        }
    }

    // Test getRecordTypeNameById method
    @isTest
    static void testGetRecordTypeNameById() {
        RecordType rt = [SELECT Id, Name FROM RecordType WHERE SObjectType = 'Paid_Time_Off__c' LIMIT 1];
        
        Test.startTest();
        String result = PaidTimeOffController.getRecordTypeNameById(rt.Id);
        System.assertEquals(rt.Name, result, 'The record type name should match.');
        Test.stopTest();
    }

    // Test DeleteHolidays method
    @isTest
    static void testDeleteHolidays() {
        List<Paid_Time_Off__c> holidaysToDelete = [SELECT Id FROM Paid_Time_Off__c LIMIT 1];
        List<Id> holidayIds = new List<Id>();
        for (Paid_Time_Off__c holiday : holidaysToDelete) {
            holidayIds.add(holiday.Id);
        }

        Test.startTest();
        PaidTimeOffController.DeleteHolidays(holidayIds);
        List<Paid_Time_Off__c> deletedHolidays = [SELECT Id FROM Paid_Time_Off__c WHERE Id IN :holidayIds];
        System.assertEquals(0, deletedHolidays.size(), 'The holiday should be deleted.');
        Test.stopTest();
    }

    // Test getSpecificHolidays method
    @isTest
    static void testGetSpecificHolidays() {
        Date specificDate = Date.today();
        Test.startTest();
        String result = PaidTimeOffController.getSpecificHolidays(specificDate);
        System.assertNotEquals(null, result, 'The result should not be null.');
        Test.stopTest();
    }

    // Test getUpcommingHolidays method
    @isTest
    static void testGetUpcommingHolidays() {
        Test.startTest();
        String result = PaidTimeOffController.getUpcommingHolidays();
        System.assertNotEquals(null, result, 'The result should not be null.');
        Test.stopTest();
    }
}