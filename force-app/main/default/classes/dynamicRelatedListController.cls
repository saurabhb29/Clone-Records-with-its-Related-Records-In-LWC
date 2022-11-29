public class dynamicRelatedListController {
 @AuraEnabled
    public static String getData(String strObjectApiName, String strfieldSetName,
                                             String criteriaField, String criteriaFieldValue){
        System.debug('#####strObjectApiName--> '+strObjectApiName);
        System.debug('#####strfieldSetName--> '+strfieldSetName);
        System.debug('#####criteriaField--> '+criteriaField);
        System.debug('#####criteriaFieldValue--> '+criteriaFieldValue);
        Map<String, String> returnMap = new Map<String,String>();
        if(!String.isEmpty(strObjectApiName) && !String.isEmpty(strfieldSetName)){
            //get field details from FieldSet
            SObject sObj = (SObject)(Type.forName('Schema.'+ strObjectApiName).newInstance());
            List<Schema.FieldSetMember> lstFSMember = 
                sObj.getSObjectType().getDescribe().fieldSets.getMap().get(strfieldSetName).getFields();

	    //prepare SOQL query based on fieldAPI names	
	    String query = 'SELECT ';
	    for(Schema.FieldSetMember f : lstFSMember) {
	        query += f.getFieldPath() + ', ';
            }
            query += 'Id FROM ' + strObjectApiName ;

            //Prepare WHERE condition if criteria field is present
            if(!(String.isEmpty(criteriaField) && String.isEmpty(criteriaFieldValue))){
                  query += ' WHERE ' + criteriaField + '=\'' + criteriaFieldValue + '\'' ;
            }
                        
	        //executing query
             List<SObject> lstRecords = Database.query(query);
            //   Contact  c = (Contact)sObj.clone( false, false, false, false );
            // c.AccountId= contactId + Contact.Name;
             //prepare a map which will hold fieldList and recordList
            returnMap.put('FIELD_LIST', JSON.serialize(lstFSMember));
            returnMap.put('RECORD_LIST', JSON.serialize(lstRecords));
            return JSON.serialize(returnMap);
        }
        return null;
    }

    @AuraEnabled

    public static void cloneAnySobject(String recordId,List<String> conObj){
        List<Contact> cont = new List<Contact>();
       Account acc = [SELECT ID, Name FROM Account WHERE Id = : recordId];
       Account accCopy = acc.clone(false,true);
       accCopy.Name = acc.Name;
       insert accCopy;
       //cloning Related contact Records
      // system.debug('@@@@conobject value:'+conObj);
      //cloning Related contact Records
  Set<Contact> setUpdate=new Set<Contact>();
       for(Contact c : [SELECT Id,FirstName,LastName, AccountId FROM Contact WHERE AccountId = : acc.Id AND Id IN:conObj]){

                      Boolean found = false;

                      for(Contact cca : accCopy.contacts) {

                          if(c.lastname == cca.lastname){

                               found = true;

                           }

                       }

                       if (!found) {

                        c.AccountId = accCopy.Id;

                           setUpdate.add(c);

                      }

                  }

               List<Contact> conUpdate = new List<Contact>(setUpdate);

               update conUpdate;



                }

              }
    



