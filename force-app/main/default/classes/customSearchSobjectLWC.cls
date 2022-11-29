public class customSearchSobjectLWC {
 @AuraEnabled(cacheable=true)
    public static List<Contact> getContactList(Id lwcRecordId, String searchKeys){
        system.debug('searchKeys:'+searchKeys);
        
        //if search key is available
        if(searchKeys !=null && searchKeys !='' ){
            String key =  '%'+ searchKeys + '%'; //search key
            List<contact> contactSearchList = [Select Id,Phone,Name,AccountId From Contact 
                                               Where Name Like :key];
            system.debug('contactSearchList:'+contactSearchList);
            return contactSearchList;
        }
        //If search key is not available
        else{
            List<Contact> contactList = [Select id,Name,Phone,AccountId From Contact ];
            //Null check
            if(!contactList.isEmpty()){
                return contactList;
            }
            return null;
        }
        
    }
}