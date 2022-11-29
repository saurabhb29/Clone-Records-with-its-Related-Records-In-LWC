public class ProductHelper {
 @AuraEnabled(cacheable=true)
    public static List<Product2> getProductList() {
        return [SELECT Id,Name,Description,Qty__c,Sales_px__c,Total_px__c
            FROM Product2];
    }
}