//HEOCampaignFactory ABI and address
import web3 from './web3';
const abi=[{"inputs":[{"internalType":"contract IHEOCampaignRegistry","name":"registry","type":"address"},{"internalType":"contract HEOGlobalParameters","name":"globalParams","type":"address"},{"internalType":"contract HEOPriceOracle","name":"priceOracle","type":"address"},{"internalType":"contract IHEORewardFarm","name":"rewardFarm","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"campaignAddress","type":"address"}],"name":"CampaignDeployed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"maxAmount","type":"uint256"},{"internalType":"uint256","name":"heoToBurn","type":"uint256"},{"internalType":"address","name":"token","type":"address"},{"internalType":"string","name":"metadataUrl","type":"string"}],"name":"createCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract HEOCampaign","name":"campaign","type":"address"},{"internalType":"uint256","name":"heoToBurn","type":"uint256"}],"name":"increaseYield","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IHEOCampaignRegistry","name":"registry","type":"address"}],"name":"setRegistry","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"priceOracle","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"globalParams","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"rewardFarm","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true}];
const address = "0x29DC16A1733F0B7D22193Be7E79737C12f7c1091";
const instance = new web3.eth.Contract(
    abi,
    address,
);

export default instance;
