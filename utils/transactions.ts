type TxOptions = {
	showErrorNotification?: Function;
	showProgressNotification?: Function;
	showSuccessNotification?: Function;
};

/**
 * Perform a contract transaction.
 * Dry re-run on failure to obtain revert reason and call `options.showErrorNotification?`.
 *
 * @param  {Function} makeTx
 * @param  {TxOptions} options?
 * @returns Promise
 */
export async function tx(makeTx: Function, options?: TxOptions): Promise<void> {
	const [contract, method, args] = makeTx();
	let hash, wait;
	try {
		({ hash, wait } = await contract[method](...args));
	} catch (e) {
		try {
			await contract.callStatic[method](...args);
			throw e;
		} catch (e) {
			const errorMessage = e.data ? hexToASCII(e.data.substr(147).toString()) : e.message;
			console.log(errorMessage);
			options?.showErrorNotification?.(errorMessage);
			throw e;
		}
	}

	options?.showProgressNotification?.(hash);

	try {
		await wait();
		options?.showSuccessNotification?.(hash);
	} catch (e) {
		console.log(e.message);
		options?.showErrorNotification?.(e.message);
		throw e;
	}
}

function hexToASCII(hex: string): string {
	// https://gist.github.com/gluk64/fdea559472d957f1138ed93bcbc6f78a#file-reason-js
	// return ethers.utils.toUtf8String(S.split(' ')[1].toString());
	let str = '';
	for (let n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
}