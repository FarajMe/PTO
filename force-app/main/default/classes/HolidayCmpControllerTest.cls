@isTest
private class HolidayCmpControllerTest {
   @isTest
    static void testFetchHolidays() {
        // Test data setup
        List<Holiday> existingHolidays = [SELECT Id, Name, ActivityDate, IsAllDay FROM Holiday];
        
        // Call the controller method
        Test.startTest();
        List<Holiday> fetchedHolidays = HolidayCmpController.FetchHolidays();
        Test.stopTest();
        
        // Assertion
        System.assertEquals(existingHolidays.size(), fetchedHolidays.size(), 'Unexpected number of holidays fetched');
        for (Integer i = 0; i < existingHolidays.size(); i++) {
            System.assertEquals(existingHolidays[i].Name, fetchedHolidays[i].Name, 'Unexpected holiday name');
            System.assertEquals(existingHolidays[i].ActivityDate, fetchedHolidays[i].ActivityDate, 'Unexpected holiday date');
            System.assertEquals(existingHolidays[i].IsAllDay, fetchedHolidays[i].IsAllDay, 'Unexpected IsAllDay flag');
        }
    }



    
    @isTest
    static void testCreateHoliday() {
        // Prepare test data
        String holidayJson = '{"title":"New Holiday","start":"2023-07-12","endD":"2023-07-14"}';
        
        // Call the controller method
        Test.startTest();
        List<Holiday> createdHolidays = HolidayCmpController.CreateHoliday(holidayJson);
        Test.stopTest();
        
        // Assertion
        System.assertEquals(3, createdHolidays.size(), 'Unexpected number of holidays created');
        Date expectedStartDate = Date.valueOf('2023-07-12');
        for (Integer i = 0; i < 3; i++) {
            System.assertEquals('New Holiday', createdHolidays[i].Name, 'Unexpected holiday name');
            System.assertEquals(expectedStartDate.addDays(i), createdHolidays[i].ActivityDate, 'Unexpected holiday date');
            System.assertEquals(true, createdHolidays[i].IsAllDay, 'Unexpected IsAllDay flag');
        }
    }
    
    @isTest
    static void testDeleteHolidays() {
        // Test data setup
        List<Holiday> holidays = new List<Holiday>();
        for (Integer i = 0; i < 3; i++) {
            Holiday h = new Holiday(Name = 'Holiday ' + i, ActivityDate = Date.today().addDays(i), IsAllDay = true);
            holidays.add(h);
        }
        insert holidays;
        
        List<Id> holidayIds = new List<Id>();
        for (Holiday h : holidays) {
            holidayIds.add(h.Id);
        }
        
        // Call the controller method
        Test.startTest();
        HolidayCmpController.DeleteHolidays(holidayIds);
        Test.stopTest();
        
        // Assertion
        List<Holiday> deletedHolidays = [SELECT Id FROM Holiday WHERE Id IN :holidayIds];
        System.assertEquals(0, deletedHolidays.size(), 'Holidays were not deleted');
    }
    
    @isTest
    static void testGetHoliday() {
        // Test data setup
        List<Holiday> holidays = new List<Holiday>();
        for (Integer i = 0; i < 2; i++) {
            Holiday h = new Holiday(Name = 'Holiday ' + i, ActivityDate = Date.today().addDays(i), IsAllDay = true);
            holidays.add(h);
        }
        insert holidays;
        
        List<Id> holidayIds = new List<Id>();
        for (Holiday h : holidays) {
            holidayIds.add(h.Id);
        }
        
        // Call the controller method
        Test.startTest();
        List<Holiday> fetchedHolidays = HolidayCmpController.GetHoliday(holidayIds);
        Test.stopTest();
        
        // Assertion
        System.assertEquals(2, fetchedHolidays.size(), 'Unexpected number of holidays fetched');
        for (Integer i = 0; i < 2; i++) {
            System.assertEquals('Holiday ' + i, fetchedHolidays[i].Name, 'Unexpected holiday name');
            System.assertEquals(Date.today().addDays(i), fetchedHolidays[i].ActivityDate, 'Unexpected holiday date');
            System.assertEquals(true, fetchedHolidays[i].IsAllDay, 'Unexpected IsAllDay flag');
        }
    }
    
      @IsTest
    static void testUpdateHoliday() {
        // Create test data
        List<Holiday> holidays = new List<Holiday>();
        Date startDate = Date.today();
        Date endDate = startDate.addDays(5);
    
        for (Integer i = 0; i < 5; i++) {
            Holiday holiday = new Holiday();
            holiday.Name = 'Test Holiday';
            holiday.ActivityDate = startDate.addDays(i);
            holiday.IsAllDay = true;
            holidays.add(holiday);
        }
        insert holidays;
    
        List<Id> holidayIds = new List<Id>();
        for (Holiday holiday : holidays) {
            holidayIds.add(holiday.Id);
        }
    
        // Create JSON payload
        HolidayCmpController.HolidayWrapper holidayWrapper = new HolidayCmpController.HolidayWrapper();
        holidayWrapper.title = 'Updated Holiday';
        holidayWrapper.start = startDate.addDays(2);
        holidayWrapper.endD = endDate;
    
        String holidayJson = JSON.serialize(holidayWrapper);
    
        // Call the Apex method
        Test.startTest();
        String result = HolidayCmpController.UpdateHoliday(holidayIds, holidayJson);
        Test.stopTest();
    
        // Perform assertions
        System.assertEquals('done', result);
    
        
    }

   @IsTest
    static void testUpdateHoliday_DeleteExistingHolidays() {
        // Create test data
        List<Holiday> holidays = new List<Holiday>();
        Date startDate = Date.today();
        Date endDate = startDate.addDays(5);
    
        for (Integer i = 0; i < 5; i++) {
            Holiday holiday = new Holiday();
            holiday.Name = 'Test Holiday';
            holiday.ActivityDate = startDate.addDays(i);
            holiday.IsAllDay = true;
            holidays.add(holiday);
        }
        insert holidays;
    
        List<Id> holidayIds = new List<Id>();
        for (Holiday holiday : holidays) {
            holidayIds.add(holiday.Id);
        }
    
        // Create JSON payload
        HolidayCmpController.HolidayWrapper holidayWrapper = new HolidayCmpController.HolidayWrapper();
        holidayWrapper.title = 'Updated Holiday';
        holidayWrapper.start = startDate.addDays(2);
        holidayWrapper.endD = startDate.addDays(3); // Set end date within existing holidays' range
    
        String holidayJson = JSON.serialize(holidayWrapper);
    
        // Call the Apex method
        Test.startTest();
        String result = HolidayCmpController.UpdateHoliday(holidayIds, holidayJson);
        Test.stopTest();
    
        // Perform assertions
        System.assertEquals('done', result);
    }

    @IsTest
    static void testUpdateHoliday_insertingExistingHolidays1() {
        // Create a HolidayWrapper object to simulate JSON data
        HolidayCmpController.HolidayWrapper holidayWrapper = new HolidayCmpController.HolidayWrapper();
        holidayWrapper.title = 'Nouvelles vacances';
        holidayWrapper.start = Date.newInstance(2023, 7, 8);
        holidayWrapper.endD = Date.newInstance(2023, 7, 9);
        String holidayJson = JSON.serialize(holidayWrapper);
        
        // Create existing vacations to test adding new vacations
        List<Holiday> existingHolidays = new List<Holiday>();
        Date existingStartDate = Date.newInstance(2023, 7, 10);
        Date existingEndDate = Date.newInstance(2023, 7, 12);
        Integer expectedNewHolidaysCount = 2; // The number of new vacancies to insert
        
        // Create existing vacancies
        for (Integer i = 0; i < 2; i++) {
            Holiday existingHoliday = new Holiday();
            existingHoliday.Name = 'Vacances existantes';
            existingHoliday.ActivityDate = existingStartDate.addDays(i);
            existingHoliday.IsAllDay = true;
            existingHolidays.add(existingHoliday);
        }
        insert existingHolidays;
        
        // Call the holiday update method
        List<Id> holidayIds = new List<Id>();
        for (Holiday existingHoliday : existingHolidays) {
            holidayIds.add(existingHoliday.Id);
        }
        String result = HolidayCmpController.UpdateHoliday(holidayIds, holidayJson);
        
        // Verify that the method returned 'done'
        System.assertEquals('done', result);
        
        // Check that the new vacancies have been inserted
        List<Holiday> newHolidays = [SELECT Id, Name, ActivityDate, IsAllDay 
                                      FROM Holiday 
                                      WHERE Name = 'Nouvelles vacances'];
        System.assertEquals(expectedNewHolidaysCount, newHolidays.size()); 
    }
 
}