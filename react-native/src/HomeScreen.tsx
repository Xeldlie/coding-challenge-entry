import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, {useCallback, useEffect} from "react";
import {FlatList, RefreshControl, StyleSheet, View} from "react-native";
import { Appbar, DataTable, FAB } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { selectors, actions } from "./store/inventory";
import { RootState } from "./store";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { StackParamList } from "./App";
import ProductItem from "./ProductItem";

export default (props: StackScreenProps<StackParamList, "Home">) => {
  const fetching = useSelector((state: RootState) => state.inventory.fetching);
  const inventory = useSelector(selectors.selectInventory);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      dispatch(actions.fetchInventory());
    });
    return unsubscribe;
  }, [props.navigation]);

  // Optimization
  const renderItem = useCallback(({item}) => (
      <ProductItem
          name={item.fields["Product Name"]}
          image={item.fields["Product Image"]}
          categories={item.fields["Product Categories"]}
          date={new Date(item.fields.Posted)}
      />),
      []);

  return (
    <View style={{ flex: 1, gap: 12, backgroundColor: "#fff" }}>
      <Appbar.Header mode="center-aligned" style={{backgroundColor: "#FDFBFC"}}>
        <Appbar.Content title="Inventory" titleStyle={{fontSize: 24}}/>
      </Appbar.Header>
        <SafeAreaView edges={["left", "bottom", "right"]}>
            {/* Use FlatList for Virtualization of Listentries*/}
          <FlatList
              refreshControl={<RefreshControl
                  refreshing={fetching}
                  onRefresh={() => dispatch(actions.fetchInventory())}
              />
              }
              data={inventory}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
          />
        </SafeAreaView>
        
      <SafeAreaView style={styles.fab}>
        <FAB
          icon={() => (
            <MaterialCommunityIcons name="barcode" size={24} color="#0B5549" />
          )}
          label="Scan Product"
          onPress={() => props.navigation.navigate("Camera")}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 16,
    width: "100%",
    flex: 1,
    alignItems: "center"
  }
});
