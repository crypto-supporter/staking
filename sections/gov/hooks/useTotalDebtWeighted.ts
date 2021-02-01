import { useEffect, useState } from 'react';
import useTotalIssuedSynthsExcludingEtherQuery from 'queries/synths/useTotalIssuedSynthsExcludingEtherQuery';
import { quadraticWeighting } from 'constants/snapshot';
import { toBigNumber } from 'utils/formatters/number';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';

export const useTotalDebtWeighted = (block?: number | null) => {
	const [totalDebtWeighted, setTotalDebtWeighted] = useState<number | null>(null);
	const totalSynthDebt = useTotalIssuedSynthsExcludingEtherQuery('sUSD', block);
	const isAppReady = useRecoilValue(appReadyState);

	useEffect(() => {
		const getWeightedTotalDebt = () => {
			if (isAppReady && totalSynthDebt.data) {
				const totalDebtWeighted = Number(
					quadraticWeighting(toBigNumber(totalSynthDebt.data.toString()))
				);
				setTotalDebtWeighted(totalDebtWeighted);
			}
		};

		getWeightedTotalDebt();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [block, totalSynthDebt, isAppReady]);

	return totalDebtWeighted;
};

export default useTotalDebtWeighted;
