import * as React from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as CSSType from 'csstype';
import ListItem, { LIST_VALUE_WIDTH } from './ListItem';
import { BasePerformance } from '../../';
import globalStyles, { ellipsis, preventUserSelection } from 'Common/Styles';
import Icon from 'Common/Icon';
import { clearReactRenderHistory, clearReactRenderHistorySocketMessage } from '../../reducer';

const ListWithTitleUl = styled('ul', {
  borderBottom: '15px solid #2a3648',
  ':last-child': {
    borderBottom: 'none',
  }
} as CSSType.Properties);

const TitleHolder = styled('li', {
  borderTop: '1px solid #344256',
  borderBottom: '1px solid #344256',
  padding: globalStyles.mediumSpace + ' 30px',
} as CSSType.Properties);

const Title = styled('h3', {
  width: LIST_VALUE_WIDTH,
  textAlign: 'right',
  paddingRight: globalStyles.mediumSpace,
  color: globalStyles.color.lightBlue,
  ...preventUserSelection,
  ...ellipsis,
} as CSSType.Properties);

const AtomIcon = styled(Icon, {
  marginRight: globalStyles.tinySpace,
  fontSize: '1.5em',
  top: '.250em',
});

type ListWithTitleProps = BasePerformance & {
  applicationName: string;
  dispatch: Dispatch;
}

const ListWithTitle = ({ name, data, isReactComponent, dispatch, applicationName }: ListWithTitleProps ) => {
  const handleReactHistoryOnClearClick  = () => {
    /**
     * We could batch the dispatch but for now let's keep
     * and if we start to have more of those we can add redux-batched-actions
     */
    dispatch(clearReactRenderHistory(applicationName, name));
    dispatch(clearReactRenderHistorySocketMessage(applicationName, name));
  };
  return (
    <ListWithTitleUl>
      <TitleHolder>
        <Title>{isReactComponent && <AtomIcon addTopSpace name="react-icon" />}{name}</Title>
      </TitleHolder>
      <ul>
        {data && data.map((item: any, i: number) => (
          <ListItem
            key={item.name + i}
            {...item}
            onClearClick={handleReactHistoryOnClearClick}
          />
        ))}
      </ul>
    </ListWithTitleUl>
  );
}

export default connect()(ListWithTitle);