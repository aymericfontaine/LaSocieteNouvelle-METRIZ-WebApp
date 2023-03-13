// La Société Nouvelle

// Imports
import { getAmountItems } from "../utils/Utils";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

export class Aggregate {

  constructor({id,
               label,
               periodsData}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = id;
    this.label = label;

    this.periodsData = {};
    if (periodsData) {
      Object.values(periodsData).forEach((period) => {
        this.periodsData[period.periodKey] = {
          periodKey: period.periodKey,
          amount: period.amount,
          footprint: new SocialFootprint(period.footprint)
        };
      });
    }
  // ---------------------------------------------------------------------------------------------------- //
  }

}

export const buildAggregateFromItems = ({label,items,periods}) => 
{
  let aggregate = new Aggregate({label});
  periods.forEach(period => {
    aggregate.periodsData[period.periodKey] = {
      amount: getAmountItems(items.filter(item => period.regex.test(item.date)), 2),
      footprint: new SocialFootprint(),
      periodKey: period.periodKey
    }
  })
  return aggregate;
}

export const buildAggregateFromAccounts = ({label,accounts,periods}) => 
{
  let aggregate = new Aggregate({label});
  periods.forEach(period => {
    aggregate.periodsData[period.periodKey] = {
      amount: getAmountItems(accounts.map(account => account.periodsData[period.periodKey]), 2),
      footprint: new SocialFootprint(),
      periodKey: period.periodKey
    }
  })
  return aggregate;
}