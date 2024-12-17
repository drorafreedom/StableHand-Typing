import Button from './components/atoms/button/Button';

function App() {
    return (
        <div>
            <Button onClick={() => console.log('Clicked!')}>Click Me</Button>
            <Button variant="secondary" onClick={() => console.log('Secondary Click')}>Secondary</Button>
            <Button variant="danger" isDisabled={true}>Disabled</Button>
        </div>
    );
}
