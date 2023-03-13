// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

export class Expense {

  constructor({id,
               accountNum,
               accountLib,
               providerNum,
               providerLib,
               isDefaultProvider,
               amount,
               footprint,
               date}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = id;
    
    this.accountNum = accountNum;
    this.accountLib = accountLib;

    this.providerNum = providerNum;
    this.providerLib = providerLib;
    this.isDefaultProvider = isDefaultProvider;

    this.amount = amount || 0;
    this.footprint = new SocialFootprint(footprint);

    this.date = date;
  // ---------------------------------------------------------------------------------------------------- //
  }

}