const { includes, result, extend, add, forEach, template, cond } = require("lodash");
const utilsScript = require("utils");
var varIf = utilsScript.varIf



function UniqueID() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);


}
/*

        plan formulation process:
            1) root plan state generation (3.8.1, 78)
                generate_from_initial_state function generates new plan state based on initial state for every action that NPC can perform
                                                     that has an effect key that matches a condition key of any goal.
                    this includes:
                        finding applicable actions
                        mapping action preconditions and effects to facts
                        simulating action execution to produce new plan states
                        evaluating the utility of newly generated plan states
                    ---- This root plan state becomes the parent of the remainder of the plan states generated in this function.
                    s_root = new PlanState(ID:1, hard_goal:null, soft_goals: all_goals, rating: 0, action: null, parent: null)
                        initial_facts is the set of facts in the fact set of the planning NPC at the time the planning process begins
                        all_goals is the set of all goals belonging to all drives of the planning NPC that were collected in the extract all goals function

                    ---- A plan state is generated for each action in the consumable action set
                            with an effect key that matches a condition key of any goal in the set of all
                            goals of the planning NPC. 
                        example: if wizard1 had the melee action that it could apply to goblin1, the following plan state would be generated:
                    s1 = (ID: 2, hard goal: (fact key: supplier health decrease, fact ID: 5,
                        evaluation function: fn linear minimize), soft goals: all goals, rating: 0.9,
                        generative action: (name: melee, consumer: wizard1, supplier: goblin1,
                        ...), parent: 1)
                            where the fact with the ID of 5 refers to the health of goblin1
            2) best state selection and goal completion
                
            3) finding applicable actions
            4) mapping action precondition and effect keys to facts
            5) action application(simulated) and world effect simulation to generate new plan states
            6) evaluating the utility of newly generated plan states



*/

/*
PLAN STATE:
    ---- snapshot of world and state of planning NPC + several components of the NPC relevant to the plan
    ---- new plan state generated at the beginning of plan formulation
                                and at through the application of an action during planning
    ID - unique identification number
    hard goal - set of conditions that must be satisfied as part of plan formulation
                failure to find a solution for this goal will result in plan failure
                UDGOAP hard goal is equivalent to goal state in GOAP
    soft goals- set of soft goals, where each goal is desirable to satisfy, but if unsatisfied will not result in plan failure
                used in calculating utility of state
    utility rating - represent how usefull the world state in plan state is to the set of drives of planning NPC, higher is better
    generative action - action responsible for generation of the plan state
    parent - the plan state from which this plan state was generated via an action

    "collect_predecessor_action" function generates a list of actions that led to plan state
                                            by iterating each predecesor of plan state and collecting
                                            their generative actions. 
                                            This list is used later during rating of a plan state
*/
class PlanState {
    //constructor(id, hard_goal, soft_goals, utility_rating, generative_action, parent, delta_facts = null) {
    constructor(ini) {

        this.id = ini.id
        this.hard_goal = ini.hard_goal
        this.soft_goals = ini.soft_goals
        this.utility_rating = ini.utility_rating
        this.generative_action = ini.generative_action
        this.parent = ini.parent
        this.delta_facts = ini.delta_facts
    }
    collect_predecessor_actions() {

    }

}
/*
PLANNER (3.8 74)
    ---- regresive planner creates plans that create world state of maximum utility to the NPC
    ---- utility of state is increased by achieving goals belonging to NPC drives
    ---- improved accuracy by executing actions in simulated world and evaluating utility in world it believes will exists after action execution
    ---- figure 3.5, Algorithm 3
    Output: 
        plan - plan that maximizes state utility for planing NPC
    Inputs:
        initial_facts - set of facts in the fact set of planing NPC at the time planning process begins
        consumable_actions - set of actions that the planning NPC can perform.
        [(action supplier, action supplied)] - A set of tuples where the first part of the tuple specifies which smart object supplied the action and the second part of the tuple is the action being supplied, 
                                               e.g. (door1, open door).
        planing_agent - the NPC for whom the plan is being made
        drives - set of drives belonging to the planning NPC
        top_level_utility_fn - Top level utility function being used by planning NPC
*/
class Planner {
    constructor() {

    }
//plan_states = generate_from_initial_state(initial_facts,
//    extract_all_goals(drives),
//    consumable_actions,
//    [(action_supplier,action_supplied)]
//)
    
    plan_algorithm (initial_facts,
                    consumable_actions,
                    action_supplier_supplied,
                    planning_agent,
                    drives,
                    top_level_utility_fn){

        allGoals = this.extract_all_goals()
        let plan_states = this.generate_from_initial_plan_state(initial_facts, allGoals, consumable_actions, action_supplier_supplied)

    }




    //generate_from_initial_plan_state()
    //  generates a new plan state, based on the initial state,
    //  for every action the NPC can perform
    //  that has an effect key that matches a condition key of any goal.
    generate_from_initial_plan_state(initialFacts,allGoals, consumable_actions, action_supplier_supplied)//, [{action_supplier:action_supplied}]) {
        {
            
        this.initialFacts = initialFacts
        this.consumable_actions = consumable_actions
        // 3.8.1 (78)
        //The function first generates a root plan state from the initial state
        planStates.push (new PlanState ({id: ++PSRID, hard_goal:null, soft_goals: allGoals, utility_rating:0, generative_action:null, parent:null}))
        //console.log('Root plan state generated: \n' + JSON.stringify(planStates));
        
        //console.log('Consumable actions\n' + JSON.stringify(consumable_actions));

        //for each action that effects our goal conditions make new plan state
        //console.log('consumable_actions\n' + JSON.stringify(consumable_actions));
        //console.log('first goal: ' + JSON.stringify(allGoals[0].name));
        consumable_actions.forEach(consumable_action => {
            consumable_action.effects.forEach(effect => {
                allGoals.forEach(goal => {
                    goal.conditions.forEach(condition => {
                        //console.log('effect.key\n' + JSON.stringify(effect.key));
                        //console.log('condition.key\n' + JSON.stringify(condition.key));
                        if (effect.key == condition.key){
                            //found an action of which key is matching condition for one of our goals
                            planStates.push (new PlanState({id: ++PSRID, 
                                                            hard_goal: condition, 
                                                            soft_goals: allGoals, 
                                                            utility_rating: null, 
                                                            generative_action: {
                                                                name: consumable_action.name,
                                                                consumer:0,
                                                                supplier:0},
                                                            parent: 1}))
                        }
                    });
                })

            })
            
        });

        //console.log('Initial plan states\n' + JSON.stringify(planStates));
        
        let applicable_actions = this.find_applicable_actions()
        let best_plan_state_facts = facts
        _.forEach (applicable_actions, applicable_action => {
            applicable_action.map_keys_to_facts(best_plan_state_facts)
        })

        
        return
        
        //generate new state (based on initial state) for every action NPC can perform that has an effect key that matches condition of any goal
        // this includes processes of:
        //      finding applicable actions
        //      mapping action preconditions and effects to facts
        //      simulating action execution to produce new plan states
        //      evaluating the utility of newly created plan states
        // first generate root plan state from initial state
        // state_root = new PlanState(ID:1, hard_goal: null, soft_goal: all_goals, rating: 0, action: null, parent: null)
        //      where initial facts is the set of facts in the fact set of the planning NPC at the time the planning begins.
        //      where all_goals is the set of all goals belonging to all drives of the planning NPC that were collected in the extract_all_goals function
        // this root plan state becomes the parent of the reminder of plan states generated in this function
        //
        // a plan state is generated for each actio in consumable action set with an effect key that matches the condition key 
        //  of any goal in the set of all goals of the planning NPC
        //      eg: wizard has "melee" action applicable to goblin, generate following plan:
        //          state1: = (ID:2,
        //                     hard_goal: (fact key: supplier_health_decrease, fact ID 5, eval_fn: fn_linear_minimize),
        //                     soft_goals: all_goals,
        //                     rating: 0.9,
        //                     generative_action: {name: melee, consumer: wizard1, supplier: goblin1,....}
        //                     parent:1
        //                     )
        //          fact 5 refers to health of goblin, parent:1 = association to root plan state
        // THEN enter line 2 of plan algorithm WTF
    }
    extract_actions_that_led_to_plan_state() { }
    find_applicable_actions(unsatisfied_precondition, consumable_actions, action_supplier_supplied) {
        //
        //
        // ALGORITHM 4
        //
        //
        //inputs:
            //unsatisfied_precondition
            //consumable actions (set)
            //(action_supplier, action_suppled) set of pairs of all actions supplied by smart objects
        //output: applicable actions

        // 1
        let potential_consumable_actions = []
        // 2
        
        _.forEach(smartObjects, smartObject => {
            //console.log('smartObject\n' + JSON.stringify(smartObject));
            _.forEach(smartObject.consumable_actions, consumable_action => {
                consumable_action.effects.forEach(consumable_action_effect => {
                    allGoals.forEach(goal => {
                        goal.conditions.forEach(goal_condition => {
                            //console.log('effect.key\n' + JSON.stringify(effect.key));
                            //console.log('condition.key\n' + JSON.stringify(condition.key));
                            //3
                            if (consumable_action_effect.key == goal_condition.key){
                                //console.log("potential_consumable_action:\n" + JSON.stringify(consumable_action));
                                //4 
                                //add only if unique. It will get multiplied again in next block
                                let unique = true
                                _.forEach(potential_consumable_actions, i => {
                                    unique = unique && (!_.isEqual({smartObject: smartObject, consumable_action: consumable_action}, i))
                                })
                                //console.log(unique + "_");
                                if (unique) {
                                    potential_consumable_actions.push({smartObject: smartObject, consumable_action: consumable_action})
                                }
                            //5         
                            }
                        })
                    }) 
                });
            })
        //6            
        });
        potential_consumable_actions = _.uniq(potential_consumable_actions)
        //console.log(_.isEqual(potential_consumable_actions[0], potential_consumable_actions[1]));
        //console.log("potential_consumable_action1\n" + JSON.stringify(potential_consumable_actions));
        //console.log("potential_consumable_action2\n" + JSON.stringify(potential_consumable_actions[1]));
        //7
        let applicable_actions = []
        _.forEach(smartObjects, smartObject => {
            _.forEach(smartObject.supplied_actions, supplied_action => {
                //console.log('supplied_action\n' + JSON.stringify(supplied_action));
                _.forEach(potential_consumable_actions, individual_potential_consumable_action =>{
                    if (supplied_action.name == individual_potential_consumable_action.consumable_action.name) {
                        //console.log('supplied_action: ' + JSON.stringify(supplied_action.name)+
                        //'\nindividual_potential_consumable_action: ' + JSON.stringify(individual_potential_consumable_action));

                        applicable_actions.push(new Action({
                                                        preconditions: supplied_action.preconditions,
                                                        effects: supplied_action.effects,
                                                        consumer: individual_potential_consumable_action.smartObject,
                                                        supplier: smartObject,
                                                        world_effect_generator: null}
                        ))
                    }
                })
            })
        });
        console.log("Applicable actions found: " + applicable_actions.length);
        applicable_actions.forEach(applicable_action => {
            console.log('applicable_action\n' + JSON.stringify(applicable_action));
        });
        return applicable_actions
        
        //set of pairs of all actions being supplied by the smart objects in the enviromnment
        //  first part is smart object supplying the action
        //  second part is the action being supplied
    }
    simulate_action_execution() { }
    calculate_state_utility() { }
    extract_all_goals() {
        _.forEach (drives, drive => {// get all goals
            //console.log('drive goals\n' + JSON.stringify(drive.goals));
            allGoals.push (...drive.goals)
        })
        //console.log('allGoals\n' + JSON.stringify(allGoals));
        return allGoals
    }

    /*    
    //////The UDGOAP algorithm (76)
    Input: initial facts, consumable actions, [(action supplier, action supplied)], planning agent, drives, top level utility fn
    Output: plan
    plan states = generate from initial state(initial facts,extract all goals(drives), consumable actions,[(action supplier, action supplied)])
    // begin planning main loop
    while plan states 6= ∅ do
        best plan state = plan states.argmax((s) ⇒ s.utility)
        plan states -= best plan state
        unsatisfied pre = select unsatisfied precondition(best plan state)
        if unsatisfied pre = null then
            return extract actions that led to plan state(best plan state)
        else
            // begin generating successor plan states
            applicable actions = find applicable actions(unsatisfied precondition,consumable actions, [(action supplier, action supplied)])
            actions = ∅
            for (action, supplier) ∈ applicable actions do
                actions += map keys to facts(action, initial facts)
            end
            unrated successor states = ∅
            for a in actions do
                unrated successor states += simulate action execution(a,best plan state)
            end
            rated successor states = ∅
            for s in unrated successor states do
                rated successor states += calculate utility(s, drives,top level utility fn)
            end
            // end generating successor plan states
            plan states += rated successor states
        end
    end
    // end planning main loop
    return empty plan
    */

    /*
    //////The UDGOAP planner function to find applicable actions. (82)
    Input: unsatisfied precondition, consumable actions, [(action supplier, action supplied)]
    Output: applicable actions
    potential consumable actions = ∅
    for a ∈ consumable actions do
        if a.effects ∩ unsatisfied precondition 6= ∅ then
            potential consumable actions += a
        end
    end
    applicable actions = ∅
    for (supplier, supplier action) ∈ [(action supplier, action supplied)] do
        if supplier action ∩ potential consumable actions 6= ∅ then
            applicable actions += new Action(
            preconds: supplier action.preconds,
            effects: supplier action.effects,
            consumer: planning agent,
            supplier: supplier,
            world effect gen:
            applicable action.world effect gen)
        end
    end
    return applicable actions
    */
}
/*
SMART OBJECTS (70)
    ---- NPCs (creeps) and OBJECTS (container, spawn, storage, tower..) + important items (energy source, room controler)
    
    
    each smart object have set of actions to be performed on them (energy source: harvest_energy_source)
    Actions only apply to smart objects. Anything that isnt smart object is non-interactable (wall, swamp)
    Objects cannot perform actions, only have actions applied to them
        NPC is a type of Object that can also perform(apply) actions
    Each NPC has
        a) supplied action set - list of actions it can be supplied with (performed on the this NPC)
        b) consumable action set - list of actions that NPC can consume (perform) on other objects
            (creep  supplied   action heal - others might heal me)
            (healer consumable action heal -        might heal others)

            set of actions to NPCs and objects are decided at design time
*/
class SmartObject {
    constructor(object) {
        this.entity = object.entity
        this.supplied_actions = object.supplied_actions
        this.consumable_actions = object.consumable_actions
    }
}


//const smartobject_source1 = new SmartObject(action_goto);



//const action_goto = new Action({name: goto}, //action name
///*preconditions*/              [{key: consumer_movepart_add, evaluation_function : supplier_energy_capacity_for_movepart_construct}],
///*effects*/                    [{key: consumer_position_change, application_function : goto_supplier}],
///*world effect generators*/    []);




//m (ID: 48, entity: hero1, attribute: health, value: 50, timestamp: 1.2)
//const fact1 = new Fact      (
/*id*/
/*entity*/
/*attribute*/
/*value*/
///*timestamp*/               );


//const sensor_internal = 
//const sensors_spawn = [sensor_internal, sensorb]


/*
NPCs (agents) (65)
    ---- build and store set of facts, keep its drives, goals up to date, enact behaviour returned grom UDGOAP planner
    ID - unique identifier of the agent
    sensors - use to get info about world, generate facts and push to facts_memory
    facts - The set of facts known to the NPC about itself and its environment.
    consumable actions - set of actions agent is able to perform
    supplied actons - set of actions OTHERS are able to perform on this NPC
    drives - set of drives that direct behaviour of the NPC
    internal state - (?facts?) The set variables that describe the information available to the NPC about itself, e.g. its current health level.
    top-level utility function - The utility function that is used to determine how preferable a world state is based on the weighted satisfaction of the drives belonging to the NPC.



    The sensing and fact update processes are the first and second processes in the NPC update process  as shown in Figure 3.3
    The up-to-date facts are used to update the NPC drive set.
    Updating drives:
        1) add new drives by some outside source    internal at design time (soldier with kill_all_enemies but medic does not), 
                                                    external by other world entities (soldier protect medic - or by map: if reached machine gun, man it))
                                                    all orders to add drive comes trough sensors
        2) remove drives that are no longer applicable to the NPC
        3) update goals belonging to each drive (do after sensing but before planning process of the NPC update process (fig 3.3))
        process of "updating goals" of a drive are part of process of updating a drive
    removal triggers (67) of drives checked after eval function updates completeness
    when drive is removed, so are all the goals generated from goal generator of that drive
    Updating drive goals:
        1) generate new goals
            1) check which goal-generation-triggers have been activated
            2) up-to-date set of facts is used to check triggers that only depend on the current state (eg current mana of NPC)
            3) add newly generated goals to goal set of the drive
        2) update goals completenes
            1) run goals eval function
        3) remove complete goals
            1) all removal triggers on all goals are checked
        
        Updating drive goals require:
            the input of the up-to-date set of facts
            the old set of facts that were most up to date in previous sensing iteration
            set of goal generation triggers
            set of existing goals
        some goals might be removed when updating
        Remaining goals become new goal set of NPC
*/
class NPC extends SmartObject {
    constructor(entity, supplied_actions, sensors, actuators, facts, consumable_actions, drives, top_level_utility_fn) {
        super(entity, supplied_actions)


        //supplied_actions (inherited)
        this.sensors = sensors
        this.actuators = actuators
        this.facts = facts
        this.consumable_actions = consumable_actions
        this.drives = drives
        this.top_level_utility_fn = top_level_utility_fn
    }

    sense() {
        let combinedSensedData = []
        _.forEach(this.sensors, sensor => {
            let sensorSensedData = sensor.sense()
            sensorSensedData.forEach(element => {
                combinedSensedData.push(element)
            });
        })
        return combinedSensedData
    }
    act() { }
    update_drives() { }
    update_facts() { }
    find_supplied_actions() { }
}
/*
ACTIONS (71)
    --- Something that can be performed by NPC to change the world
    name - unique identifier of the action
    preconditions - set of functions (return float 0-1) that must be satisfied for action to be executable
        consists of:
        key - describe how to satisfy precondition (action heal has precondition "enough mana", so key to describe how to satisfy this condition is "consumer_mana_increase")
              used to reduce number of actions that are needed to be considered during plan formulation (3.8)
        fact ID - The fact attribute and fact ID are used to find which fact the precondition applies to (3.8.4)
        predicate evaluation function - tests if predicate is true for given fact (if NPC consuming heal action has enough mana)
            each function hardcoded for each action
    effects - set of changes that will become part of the world state after the execution of the action
              Each effect have an application function that returns a fact that would exist if that fact was applied to another fact
        consists of:
        key - used to reduce number of actions that are needed to be considered during plan formulation
        aplication function - calculate how a fact would change as a result of the application of the effect
                              Each effect application function is made by a designer specifically for each action.
                              For example, one of the effects of
                                the heal action increases the health of the action supplier. The application
                                function could take the fact associated with the current health of the action
                                supplier and return the same fact but with an increased health value of 20.


    supplier - the smart object upon which the action is being performed. "supplier" because that smart object made the action available for application
    consumer - the NPC performing the action. "consumer" because it uses the action made available by the action supplier
               (energy source supplies action "harvest_energy" to creep, which can consume it, so supplier = source and consumer = creep)
    world effect generator - (85 (3.8.5)) 

    each action must have supplier and consumer (example 73)
*/
class Action {
    constructor(ini) {
        this.name = ini.name
        this.preconditions = ini.preconditions
        this.effects = ini.effects
        this.world_effect_generator = ini.world_effect_generator
        this.consumer = ini.consumer
        this.supplier = ini.supplier
    }

    map_keys_to_facts(best_plan_state_facts) { 


    }
    key_to_fact(best_plan_state_facts){


    }


    /*
    ////// The UDGOAP planner function for mapping keys to facts. (83)
    Input: unmapped action, best plan state facts
    Output: actions
    mapped action = unmapped action.clone()
    for precond ∈ mapped action.preconds do
        precond.fact id = key to fact(precond.key, mapped action.consumer, mapped action.supplier, best plan state facts)
    end
    for effect ∈ mapped action.effects do
        effect.fact id = key to fact(effect.key, mapped action.consumer, mapped action.supplier, best plan state facts)
    end
    return mapped action
*/
}
class Effect {
    constructor(key, fact_id) {
        this.key = key
        this.fact_id = fact_id
    }

    application_function() { }
    execute_effect() { }

}

/*
FACTS and memory
    ---- World as Agent knows it is described by facts
    ID - a number for unique identification of a fact
    entity - the entity in the world to which the fact refers (object or agent)
    attribute - the attribute of the entity to which the fact refers. eg: health attribute means reffering to health of entity
    value - the value of the attribute the fact refers to
    timestamp - the time at which the fact was last updated
    Example: NPCs own health: (ID:48, entity:creep1, attribute: health, value: 50, timestamp: 2) 
    The timestamp is used to give preference to more recent facts and to make it easier to garbage collect facts when there are too many.
    The fact set is updated every time the NPC queries its sensors. The newest set of facts, as well as the previously known facts that were stored in memory, are used to inform which behaviour will be selected by the NPC.
*/
class Fact {
    constructor(id, entity, attribute, value, timestamp) {
        this.id = id
        this.entity = entity
        this.attribute = attribute
        this.value = value
        this.timestamp = timestamp
    }
    update() { }

}
class WorldEffectGenerator {
    constructor(triggers, effects) {
        this.triggers = triggers
        this.effects = effects
    }
    
    check_triggers_and_generate_goals() { }
    generate_effect() { }
}
class Precondition {
    constructor(key, fact_id) {
        this.key = key
        this.fact_id = fact_id
    }
    evaluation_function() { }
    is_satisfied() { }
}
class GoalState {
    constructor(conditions) {
        this.conditions = conditions
    }
}

/*
DRIVES
    ---- A drive is high level director of NPC behaviour. This direction is performed through the pursuit of goals that are generated by goal generators belonging to drives. 
    ---- For example, the kill all enemies drive of the wizard could have one goal to kill one goblin and another goal to kill another goblin, both generated upon seeing the goblins.
    name - the unique identifier of the drive
    goal generator - a set of rules that will create goals that, if achieved, will increase the satisfaction of the drive
    goals - set of goals generated by the goal generator of the drive that will improve the satisfaction of the drive when one of its goal is nearer to achievment
    weight - a number used to represent the importance of the drive. The weight may be used in the top-level NPC utility function
    removal triggers - Triggers activated when certain conditions are satisfied, resulting in the removal of the drive from the set of drives belonging to an NPC.
    satisfaction evaluation function - The function that calculates and returns a normalised value denoting how satisfied the drive is based on the degree to which the goals of the drive are achieved.
    satisfaction - stores the value output from the satisfaction utility function
    
    A goal generator (61) can create goals to be pursued by agent
        Each drive is associated with one goal generator
        Each goal is associated with a set of trigger-goal pairs
        When a trigger is activated at run-time, the corresponding goal is added to the goal set of the drive to which the goal generator belongs.
        Triggers are activated by the presence of certain facts, e.g. an enemy has been spotted.
    Goal generation takes: facts (old and new) + goal generator for drive *d*
*/
class Drive {
    constructor(name, goal_generator, weight, removal_triggers, satisfaction) {

        this.name = name
        this.goal_generator = goal_generator
        this.weight = weight
        this.removal_triggers = removal_triggers
        this.satisfaction = satisfaction
        this.goals = []//updated by this.update_goals()
    }

    Drive_satisfaction_function() {
        this.satisfaction = 0
        this.goals.forEach(goal => {
            this.satisfaction += goal.weight * goal.completeness / this.goals.length
        });


    }
    add_drive() { }
    remove_drive() { }
    update_goals() {
        this.goals = this.goal_generator.check_triggers_and_generate_goals()
        return
        let newGoalsToAdd = this.goal_generator.generatedGoals
        newGoalsToAdd.forEach(newGoalToAdd => {
            //console.log(JSON.stringify(this.goals));
            //console.log(JSON.stringify(newGoalToAdd));
            if (this.goals.length == 0) { this.goals.push(newGoalToAdd);return} // add if not there already
            //mark if dup
            let notdup = true
            this.goals.forEach(oldGoal => {
                if (/*(oldGoal.generatedGoal.id == newGoalToAdd.generatedGoal.id) //not relevant as all goals come in with their id = 1, so dynamically assign goal ID once the goal has been accepted
                    &&*/(oldGoal.generatedGoal.triggerResultRelevantFacts.id == newGoalToAdd.generatedGoal.triggerResultRelevantFacts.id)
                    && (oldGoal.generatedGoal.goalRelevantFacts.id == newGoalToAdd.generatedGoal.goalRelevantFacts.id)) {
                    notdup = false
                    return
                }
            });
            if (notdup) {
                this.goals.push(newGoalToAdd)
            }

            //}
        });
        console.log(JSON.stringify(this.goals));
    }
}



class GoalGenerator {
    constructor(ini) {
        this.name = ini.name
        this.goalGenerationTriggers = []
        this.goalGenerationTriggers.push(ini.goalGenerationTriggers)
        this.goalTemplate = ini.goalTemplate
    }
    check_triggers_and_generate_goals() {
        // each trigger gets checked against facts
        let generatedGoals = []
        _.forEach (this.goalGenerationTriggers, goalGenerationTrigger =>{
            //Find fact and ID satisfying first condition
            //  loop trough all facts looking for same entity ID facts
            //  check if any of such facts satisfy any of remaining conditions
            //  when all facts were checked, count amount of satisfied conditions
            //  if all, return fact ID
            //continue to find more entities like above

            let individualTriggerHits = [] // each individual condition match will get stored here
            let condition0 = goalGenerationTrigger.conditions[0]
            _.forEach (facts, fact => {
                // if condition and fact match
                let triggeringFact = null
                let hitcount = 0
                if (varIf(fact.attribute, "==",                   condition0.attribute) 
                &&  varIf(fact.value,     condition0.operator,    condition0.value)) {
                    triggeringFact = fact
                    let filteredFacts = _.filter(facts, (filteredFact) => fact.entity == filteredFact.entity)
                    _.forEach (goalGenerationTrigger.conditions, condition=> {
                        _.forEach (filteredFacts, fact2 => {
                            if (varIf(fact2.attribute,  "==",               condition.attribute) 
                            &&  varIf(fact2.value,      condition.operator, condition.value)) {
                                hitcount++
                            }    
                        })
                    })
                }
                if (hitcount == goalGenerationTrigger.conditions.length){
                    //console.log("Fact " + triggeringFact.id + " triggered goal generation");
                    generatedGoals.push(this.generate_goal(triggeringFact))
                }
            })
            /*
            //Counts occurences
            //console.log(JSON.stringify(individualTriggerHits)) // => {A, A, A, B, B, C}
            let occurences = individualTriggerHits.reduce(function (acc, curr) {
                return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
              }, {});
            //console.log(JSON.stringify(occurences)) // => {A:3, B:2, C:1}

            let triggerHits = [] //if single entity triggered same amount of time as amount of conditions of a trigger
            _.forEach(Object.keys(occurences), occurencekey => {
                if (occurences[occurencekey] == goalGenerationTrigger.conditions.length){
                    // mark as real triggered trigger
                    triggerHits.push  (occurencekey)
                }
            })
            // return an array of Entity IDs which triggered this trigger
            _.forEach(triggerHits, triggerHit => {
                this.generate_goal(triggerHit)
            });
            //return (triggerHits);
            console.log(triggerHits);
            */
        })
        console.log(generatedGoals.length + " generated goals.");
        return generatedGoals
        /*
        let generatedGoals = []
        _.forEach(facts, fact=> {
            let conditionHits = 0
            _.forEach(this.goalGenerationTrigger.conditions, condition =>{
                if (fact.attributes[condition.attribute] != undefined) {
                    conditionHits ++
                }
            })
            if (conditionHits == this.goalGenerationTrigger.conditions.length){
                generatedGoals.push (this.generate_goal(fact))
            }
        })
        //console.log('generatedGoals\n' + JSON.stringify(generatedGoals));
        return generatedGoals
        */
    }
    find_relevant_facts() {
    }
    generate_goal(fact) { // fact that triggered generation of goal
        
        //all of below is just copying from template
        let newConditions = _.cloneDeep(this.goalTemplate.conditions)
        let generatedGoal = new Goal({
            id: ++GRID, name: this.goalTemplate.name, weight: this.goalTemplate.weight,
            conditions: newConditions,
            eval_fn: this.goalTemplate.eval_fn,
            removal_triggers: this.goalTemplate.removal_triggers,
            completeness: this.goalTemplate.completeness
        })
        for (let i = 0; i < this.goalTemplate.conditions.length; i++) {
            generatedGoal.conditions[i].eval_fn = this.goalTemplate.conditions[i].eval_fn
        }
        //all of above is just copying from template

        
        generatedGoal.conditions.forEach(condition => {
            condition.fact_id = fact.id
            //condition.eval_fn = this.goalTemplate.conditions.eval_fn
            //console.log('EVAL\n' + JSON.stringify(condition.eval_fn(fact.id))); 
        });

        //console.log('generatedGoal\n' + JSON.stringify(generatedGoal));      
        
        return generatedGoal


    }
}
/*
GOALS (63)
    ---- purpose of increasing the satisfaction of the drive from which they were spawned
    ID - the unique identifier of the goal
    name - The name of the goal (eg kill_enemy)
    conditions - (min 1) conditions required to achieve the goal. (eg enemy health = 0)
    weight - number representing importance of the goal. May be used in eval function of the drive to which the goal belongs.
             goals belonging to the same drive might have different weights.
             eg: goal of killing a bomb slinging goblin might be bigger than goal to kill a sword wielding goblin
    removal triggers - activated when condition satisfied: remove goal from goalset of the drive parent. Used to remove complete/non-relevant goals
    evaluation function - (0 - 1 float) calc degree of completion of goal based on conditions relevant to goal
    completeness - stores the value output from the eval. function

    
    goals created by drive trigger, deleted by goal trigger.
    removal triggers of goals checked after eval function updates completeness
    some goals (maximize health) might have no removal triggers if its always concern
    all goals belong to the drive that generated them
*/
class Goal {
    constructor(ini) {
        this.id = ini.id
        this.name = ini.name
        this.weight = ini.weight
        this.conditions = ini.conditions
        this.removal_triggers = ini.removal_triggers
        this.eval_fn = ini.eval_fn
        this.completeness = ini.completeness
    }

    Goal_evaluation_function(triggerResultRelevantFacts) {
        //calculate completeness based on eval_func supplied at goal template creation
        //this.triggerResultRelevantFacts = triggerResultRelevantFacts
        //this.completeness = this.eval_fn();

    }
    generate_new_goals() { }
    update_goal_completeness() {
        //calculate conditions
        let result = 0 //total goal completeness
        let conditionValues = [] //array that holds evaluations of individual conditions
        this.conditions.forEach(condition => {
            conditionValues.push(condition.eval_fn(condition.fact_id)) //eval_fn of condition
        });
        this.completeness = this.eval_fn(conditionValues)
        return this.completeness
    }
    remove_completed_goals() { }
}

class Sensor {
    constructor(sensorName) {
        this.name = sensorName
    }
    sense() {
        
        let facts = []
        //sense internal state
        /*NPCs.forEach(NPC => {
            let attributeObject = {}
            for (let attribute in NPC.entity) {
                let attributeObject2 = {}
                attributeObject[attribute] = NPC.entity[attribute]
            }
            let fact = new Fact(factID, NPC.entity["id"], attributeObject, Game.time)
            facts.push(fact)
            factID++
        });*/
        smartObjects.forEach(smartObject => {
            /*for (let attribute in smartObject.entity[this.name]) {
                attributeObject[attribute] = smartObject.entity[attribute]
            }*/
            if (this.name == "instanceOf") {
                if (smartObject.entity instanceof Structure){
                    let fact = new Fact(/*id =       */   FRID++,
                    /*entity =   */   smartObject.entity["id"],
                    /*attribute =*/   "instanceOf",
                    /*value =    */   "structure",
                    /*timestamp =*/   Game.time)
                    facts.push(fact)
                    fact = new Fact(/*id =       */   FRID++,
                    /*entity =   */   smartObject.entity["id"],
                    /*attribute =*/   "structureType",
                    /*value =    */   smartObject.entity.structureType,
                    /*timestamp =*/   Game.time)
                    facts.push(fact)
                }
                else if(smartObject.entity instanceof Creep){
                    let fact = new Fact(/*id =       */   FRID++,
                    /*entity =   */   smartObject.entity["id"],
                    /*attribute =*/   this.name,
                    /*value =    */   "Creep",
                    /*timestamp =*/   Game.time)
                    facts.push(fact)
                }
                else if(smartObject.entity instanceof Source){
                    let fact = new Fact(/*id =       */   FRID++,
                    /*entity =   */   smartObject.entity["id"],
                    /*attribute =*/   this.name,
                    /*value =    */   "Source",
                    /*timestamp =*/   Game.time)
                    facts.push(fact)
                }
                else if(smartObject.entity instanceof RoomController){
                    let fact = new Fact(/*id =       */   FRID++,
                    /*entity =   */   smartObject.entity["id"],
                    /*attribute =*/   this.name,
                    /*value =    */   "Source",
                    /*timestamp =*/   Game.time)
                    facts.push(fact)
                }
 
            }
            else if (smartObject.entity[this.name]) {
                let fact = new Fact(/*id =       */   FRID++,
                /*entity =   */   smartObject.entity["id"],
                /*attribute =*/   this.name,
                /*value =    */   smartObject.entity[this.name],
                /*timestamp =*/   Game.time)
                facts.push(fact)
            }
        });
        
        return facts
    }
}
/*check for
    attribute == type
    value == source
    attribute == energy
    value == more than 0

*/
class Trigger {
    constructor(ini) {
        this.id = ini.id
        this.name = ini.name
        this.conditions = ini.conditions

    }
    check_trigger() {
        let triggeredFacts = [] //get list of all facts that at least one condition point to
        facts.forEach(fact => {
            let conditionHits = 0
            this.conditions.forEach(condition => {
                _.forEach(Object.keys(fact.attributes), attribute => {
                    if (condition.attribute == (attribute)) {
                        if (varIf(fact.attributes[attribute], condition.operator, condition.value)) {
                            conditionHits++
                        }
                    }
                })
                if (conditionHits == this.conditions.length) {
                    triggeredFacts.push(fact)
                }
            })
        });
        return triggeredFacts
    }
}


//console.log("rest");

var actions = []
//action precondition: key, fact ID, predicate eval function
//      key: key to describe how to satisfy condition
//      key: entity_attribute_change (eg for "heal" action the key is: consumer_mana_increase)
//      fact attribute and fact ID: used to find which fact this precondition applies to
//      fact attribute and fact ID: 

fn_has_enough_workpart = null
fn_increase_carried_energy = null
fn_drop_energy = null
source_mined = null
/*
actions.push(new Action({name: "harvest_source_while_having_free_carry_capacity",
                        preconditions: {key:"consumer_workpart_add", eval_func: fn_has_enough_workpart},
                        effects:[{key:"consumer_carried_enery_increase", sim_func: fn_increase_carried_energy},
                                 {key:"supplier_energy_decrease", sim_func: source_mined}]
}))
actions.push(new Action({name: "harvest_source_while_not_having_free_carry_capacity",
                        preconditions: {key:"consumer_workpart_add", eval_func: fn_has_enough_workpart},
                        effects:[{key:"consumer_energy_dropped", sim_func: fn_drop_energy},
                                 {key:"supplier_energy_decrease", sim_func: source_mined}]

}))*/

actions.push(new Action ({name: "workcreep_harvesting_source",
                          preconditions: {key: "workcreep_near_source", eval_func: null},
                          effects: [{key:"workcreep_energy_increase", sim_func:null},
                                    {key:"source_energy_decrease", sim_func:null}]
}))
actions.push(new Action ({name: "workcreep_upgrading_controller",
                          preconditions: {key: "workcreep_near_controller", eval_func: null},
                          effects: [{key:"workcreep_energy_decrease", sim_func:null},
                                    {key:"controller_progress_increase", sim_func:null}]
}))
actions.push(new Action ({name: "spawn_creep",
                          preconditions: {key: "spawn_energy_increase", eval_func: null},
                          effects: [{key:"spawn_energy_decrease", sim_func:null},
                                    {key:"spawn_working_start", sim_func:null}]
}))






var smartObjects = []
var NPCs = []

// add all smartObjects (everything)
_.forEach(Game.spawns, spawn => {
    smartObjects.push(new SmartObject({entity: spawn, supplied_actions: [], consumable_actions: [actions[2]]}));
    smartObjects.push(new SmartObject({entity: spawn.room.controller, supplied_actions: [actions[1]], consumable_actions: []}));
    _.forEach(spawn.room.find(FIND_SOURCES), source => {
        smartObjects.push(new SmartObject({entity: source, supplied_actions: [actions[0]], consumable_actions: []}));
        //console.log(JSON.stringify(smartObjects[(smartObjects.length-1)]));
    })
});
_.forEach(Game.creeps, creep => {
    smartObjects.push(new SmartObject({entity: creep, supplied_actions: [], consumable_actions: [actions[0]]}));
})

/*
_.forEach(Game.creeps, creep => {
    //NPCs.push(creep)
    NPCs.push(new NPC(creep, actions))
})
*/
console.log("NPCs / smartObjects: " + NPCs.length + " / " + smartObjects.length);


//NPC create - create sensors
sensors = []
var FRID = 0 // Facts rolling ID
//sensors.push (sensorAll = new Sensor("internalAll"))
sensors.push (sensorInstanceOf = new Sensor("instanceOf"))
sensors.push (sensorPosition = new Sensor("pos"))
sensors.push (sensorEnergy = new Sensor("energy"))
sensors.push (sensorEnergyCapacity = new Sensor("energyCapacity"))
sensors.push (sensorMy = new Sensor("my"))

//sensors.push (sensorRoomControllers = new Sensor("RoomControllers"))
//sensors.push (sensorSpawns = new Sensor("Spawns"))
//sensors.push (sensorOwnCreeps = new Sensor("OwnCreeps"))
//sensors.push (sensorSources = new Sensor("Sources"))
//sensors.push = [sensorInternalState]

//NPC create - create GoalGenerator - create triggers (triggers: any, goal: any) (trigger:goal pairs). Triggers activated by presence of facts


//var eval_func1 = function () { return (1 - Math.abs((this.conditions[1].value - this.triggerResultRelevantFacts.attributes.energy) / this.triggerResultRelevantFacts.attributes.energyCapacity)) }
var fn_source_energy_linear_inverse = function(fact_id){ // returns how empty the source is: 0 for full, 1 for empty
    let fact = _.find(facts, match => match.id == fact_id)
    //console.log('fact\n' + JSON.stringify(fact));
    let supportFact = _.find(facts, match => ((match.entity == fact.entity) && (match.attribute == "energyCapacity")))
    //console.log('supportFact\n' + JSON.stringify(supportFact));
    let result = (Math.abs((supportFact.value - fact.value) / supportFact.value))
    return result
}
var fn_linear_normalized = function(array){ // returns how empty the source is: 0 for full, 1 for empty
    let result = array.reduce((a,b) => a + b)
    return result
}

var fn_top_utility = function(drives){
    let result = 0
    _.forEach(drives, drive => {
        result = drive.satisfaction * drive.weight
    })
    return result = result/drives.length
}


//console.log(JSON.stringify(triggers));

//DRIVE HARVEST ENERGY
var goalGenerationTriggers = []
goalGenerationTriggers.push(new Trigger({
    name: "source_has_energy", 
    conditions:[{attribute: "energy", value: "0", operator: ">=" },
                {attribute: "instanceOf", value: "Source", operator: "==" }]
}))

var goalRemovalTriggers = []
goalRemovalTriggers.push(new Trigger({
    name: "source_has_no_energy", 
    conditions: [{attribute: "instanceOf", value: "Source", operator: "==" },
                 {attribute: "energy", value: "0", operator: "==" }]
}))

var goalTemplates = []
goalTemplates.push(new Goal({
    id: null, name: "Harvest Source", weight: 1,
    conditions: [{ key: "source_energy_decrease", fact_id: null, eval_fn: fn_source_energy_linear_inverse }],
    eval_fn: fn_linear_normalized,
    removal_triggers: "source_has_no_energy",
    completeness: null
}))

//goal template (x) for goal generator (1)
//trigger (x) for goal generator (1)

//goal generator(1) for the drive(1)
var goalGenerators = []
goalGenerators.push(new GoalGenerator({
    name: "Harvest Source",
    goalGenerationTriggers: goalGenerationTriggers[0],
    goalTemplate: goalTemplates[0]
}))

var drives = []
drives.push(new Drive("Harvest Energy", goalGenerators[0], 1, null, null))

//var Director = new NPC(sensors,actuators,old_facts,consumable_actions,drives,top_level_utility_fn);
var Director = new NPC({"name":"Director"},null,sensors, null, null, null, drives, null);
NPCs.push (Director);


//create facts
var facts = Director.sense()
console.log('facts\n' + JSON.stringify(facts));
//_.forEach (facts, fact => {console.log(JSON.stringify(fact));}) // debug


var GRID = 0 // goals rolling ID
_.forEach (drives, drive => {// create new goals for this drive
    drive.update_goals()
    _.forEach (drive.goals, driveGoal => {// update completeness of goals
        driveGoal.update_goal_completeness()
        //console.log('drive\n' + JSON.stringify(drive));
        //console.log('driveGoal\n' + JSON.stringify(driveGoal));
        //the following snippet would prolly work if drive.goals wouldnt be completely empty
        //the check then always fail
        /*if (drive.goals.some(goal => goal.id != driveGoal.id) || drive.goals.length == 0) {
            drive.goals.push(driveGoal)
        }*/
        /*let isIn = false
        drive.goals.forEach(goal => {
            if (goal.id == driveGoal.id) {
                //isIn = true
            }
        }); 
        if (!isIn) {
            drive.goals.push(driveGoal)
        }*/
    });
    drive.Drive_satisfaction_function()
    console.log("Drive '" + drive.name + "' satisfaction: " + drive.satisfaction);
    //add goals to list of this drives goal (if unique)
    //remove finished goals
})



var PSRID = 0 // plan states rolling ID
var planStates = []
let allGoals = []
var planner1 = new Planner();

var action_supplier_supplied = []
var action_consumer_consumed = []
_.forEach (smartObjects, smartObject => {
    _.forEach(smartObject.supplied_actions, supplied_action => {
        action_supplier_supplied.push(smartObject/*, supplied_action*/)
    })
    _.forEach(smartObject.consumable_actions, consumable_action => {
        action_consumer_consumed.push(smartObject/*, supplied_action*/)
    })
})
//console.log('action_supplier_supplied\n' + JSON.stringify(action_supplier_supplied));

top_level_utility_fn = function(drives) {
    
}


planner1.plan_algorithm(facts, actions, action_supplier_supplied, null, drives, fn_top_utility)


//planner1.generate_from_initial_plan_state(facts, allGoals, consumable_actions, action_supplier_supplied) //LINE 1
//console.log('planStates\n' + JSON.stringify(planStates));
//console.log('facts\n' + JSON.stringify(facts));
//while (planStates != null){
//    let best_plan_state = planStates.
//    return
//}



//triggeredFacts.forEach(triggeredFact => {
//    generatedGoals.push(goal_generator1.generate_goal(triggeredFact))
//})



/*
//planner algo:
inputs: initial facts
        consumable_actions
        [(action_supplier, action_supplied)]
        planning_agent
        drives
        top_level_utility_fn
output: plan

plan_states = generate_from_initial_state(initial_facts,
                                            extract_all_goals(drives),
                                            consumable_actions,
                                            [(action_supplier,action_supplied)]
)
//begin planning main loop
while (plan_states != null)                                     //if there are some plan states
    best_plan_state = plan_states.argmax((s) => s.utility)      //select plan state with highest utility
    plan_states -= best_plan_state                              //remove this plan state from the rest
    unsatisfied_pre = select_unsatisfied_precondition(best_plan_state) //find unsatisfied precondition of plan state
    if (unsatisfied_pre == null) {                              //no unsatisfied precondition (reachable state)
        return extract_actions_that_led_to_plan_state (best_plan_state)
    }else{                                                      
        //unsatisfied precondition, find successor plan states
        applicable_actions = find_applicable_actions(unsatisfied_precondition,
                                                     consumable_actions,
                                                     [(action_supplier,action_supplied)]
        ) 
        actions = null
        for ((action, supplier) in applicable_actions) {
            actions += map_keys_to_facts(action,initial_facts)
        }
        unrated_successor_states = null
        for (action in actions){
            unrated_successor_states += simulate_action_execution(action, best_plan_state)
        }
        rated_successor_states = null
        for (state in unrated_successor_states){
            rated_successor_state += calculate_utility(state,drives,top_level_utility_fn)
        }
        //end generating successor plan states
        plan_states += rated_successor_states
    }
}
//end planning main loop
return empty plan












planner1.find_applicable_actions(/*unsatisfied_precondition, consumable_actions, [(action_supplier, action_supplied]))*/
//goal_generator1.check_triggers_and_generate_goals()
//goalGenerationTriggers[0].check_trigger() // has to have facts ready

//update drives 
//need  up to date facts (have in facts)
//          old facts 
//          goal generation triggers (have in goalGenerationTriggers)
//          set of existing goals (none yet)
//  do:
//      generate new goals
//      update goal completeness
//      remove complete goals







/*
NPCs.forEach(NPC => {
    console.log(NPC.sensors + " _ " + JSON.stringify(NPC.sensors));
});
*/
//console.log(JSON.stringify(smartObjects[0].entity.position));

//var npc_spawn = new NPC       (null, // sensors
///*actuators*/                    null,
///*facts*/                        null,
///*consumable_actions*/           null,
///*drives*/                       null,
///*entity*/               entity
///*top_level_utility_fn*/  );
/*
console.log(JSON.stringify(npc_spawn));
console.log(npc_spawn);
/*
console.log(JSON.stringify(npc_spawn.entity));
console.log((npc_spawn.entity));
*/

module.exports = {
    NPCs
}