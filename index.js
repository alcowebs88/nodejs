const chalk = require('chalk')
const inquirer = require('inquirer')
const fs = require('fs')

console.log('iniciando o projeto')

operation()

function operation(){
inquirer.prompt([{
	type:'list',
	name:'action',
	message:'o que deseja fazer',
	choices:[
		'criar conta',
		'consultar saldo',
		'depositar',
		'sacar',
		'sair'
	]
}])
.then((answer)=>{
	const action = answer['action']
	if(action === 'criar conta'){
		createAccount()
	}else if(action === 'consultar saldo'){
		getAccountBalance()
	}else if(action === 'depositar'){
		deposit()		
	}else if(action === 'sacar'){
		withDraw()
	}else if(action === 'sair'){
		console.log(chalk.bgBlackBright.white('obrigado por usar o Accouts'))
		process.exit()
	}				

})
.catch((err)=>{console.log(err)})

}

function createAccount(){
	console.log(chalk.bgGreen.black('parabêns pela escolha do banco'))
	console.log(chalk.green('defina as opções de sua conta a seguir'))
	buildAccount()
}
function buildAccount(){
	inquirer.prompt([{
		name:'accountName',
		message:'digite o nome para sua conta'
	}])
	.then((answer)=>{
		const accountName = answer['accountName']
		console.info(accountName)
		if(!fs.existsSync('accounts')){
			fs.mkdirSync('accounts')
		}
		if(fs.existsSync(`./accounts/${accountName}.json`)){
			console.log(chalk.bgRed.black('esta conta ja existe escolha outro nome'))
			buildAccount()
			 return 
		}
		fs.writeFileSync(`./accounts/${accountName}.json`,'{"balance":0}',function(err){
			console.log(err)
		})
		console.log(chalk.green('parabêns, a sua conta foi criada'))
		operation()
	})	
	.catch(err=>console.log(err))
}

function deposit(){
	inquirer.prompt([{
		name:'accountName',
		message:'qual conta quer depositar'
	}])
	.then((answer)=>{
		const accountName = answer['accountName']
		if(!checkAcconts(accountName)){
			return deposit()
		}
		inquirer.prompt([{
			name:'amount',
			message:'quanto vc deseja depositar'
		}])
		.then((answer)=>{
			const amount = answer['amount']
			addAmount(accountName,amount)

			operation()
		})
		.catch(err=>console.log(err))
		
	})
	.catch(err=>console.log(err))
}

function checkAcconts(accountName){
	if(!fs.existsSync(`./accounts/${accountName}.json`)){
		console.log(chalk.bgRed.white('conta não existe'))
		return false
	}
	return true
}

function addAmount(accountName,amount){
	const account = getAccount(accountName)
	if(!amount){
		console.log(chalk.bgRed.white('ocorreu um erro, tente novamente'))
		return deposit()
	}
	account.balance = parseFloat(amount)+parseFloat(account.balance)
	fs.writeFileSync(`./accounts/${accountName}.json`,JSON.stringify(account))
	console.log(chalk.green(`foi depositado o valor de ${amount} na sua conta`))
}

function getAccount(accountName){
	const accountJSON = fs.readFileSync(`./accounts/${accountName}.json`,{
		encoding:'utf-8',
		flag:'r'
	})
	return JSON.parse(accountJSON)
}

function getAccountBalance(){
	inquirer.prompt([{
		name:'accountName',
		message:'digite o nome da sua conta'
	}])
	.then((answer)=>{
		const accountName = answer['accountName']
		if(!checkAcconts(accountName)){
			return getAccountBalance()
		}
		const accountData = getAccount(accountName)
		console.log(chalk.bgBlue.green(`ola o saldo da sua conta é R$:${accountData.balance}`))
		operation()
	})
	.catch(err=>console.log(err))
}
function withDraw(){
	inquirer.prompt([{
		name:'accountName',
		message:'digite o nome da conta'
	}]).then((answer)=>{
		const accountName = answer['accountName']
		if(!checkAcconts(accountName)){
			return withDraw()
		}

		inquirer.prompt([{
			name:'amount',
			message:'quando vc quer sacar'
		}]).then((answer)=>{
			const amount = answer['amount']
			removeAccount(accountName,amount)
		}).catch(err=>console.log(err))


	}).catch(err=>console.log(err))	
}

function removeAccount(accountName,amount){
	const accountData = getAccount(accountName)
	if(!amount){
		console.log(chalk.bgRed.black('ocorreu um erro tente novamente mais tarde'))
		return withDraw()
	}
	if(accountData.balance<amount){
		console.log(chalk.bgRed.black('valor indisponivel!'))
		return withDraw()
	}

	accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
	fs.writeFileSync(`./accounts/${accountName}.json`,JSON.stringify(accountData),
		function(e){
			console.log(e)
		})
	console.log(chalk.bgGreen.white(`foi realizado o saque de R$:${amount} da sua conta`))

	operation()
}